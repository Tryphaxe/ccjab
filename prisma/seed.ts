import { PrismaClient, Role } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// --- Interfaces basées sur votre fichier JSON ---
interface JsonData {
  type: string
  name: string
  database: string
  data: any[]
}

// Maps pour stocker la correspondance Ancien ID (MySQL) -> Nouvel UUID (Prisma)
const userMap = new Map<string, string>() // OldId -> NewUUID
const salleMap = new Map<string, string>() // OldId -> NewUUID
// Pour convertir id_categorie et id_type en texte (car Prisma Even.categorie est String)
const categorieMap = new Map<string, string>() 
const typeMap = new Map<string, string>()

async function main() {
  // 1. Lire le fichier JSON
  const rawData = fs.readFileSync(path.join(__dirname, '../u185391932_reactapp.json'), 'utf-8')
  const tables: JsonData[] = JSON.parse(rawData)

  // Fonctions helper pour trouver les tables dans le tableau JSON
  const getTableData = (name: string) => tables.find(t => t.name === name)?.data || []

  console.log('🚀 Démarrage de la migration...')

  // ==========================
  // 1. CHARGEMENT DES DICTIONNAIRES (Categories & Types)
  // ==========================
  const categories = getTableData('categories')
  categories.forEach((c: any) => categorieMap.set(c.id, c.nom_categorie))

  const types = getTableData('types')
  types.forEach((t: any) => typeMap.set(t.id, t.nom_type))

  // ==========================
  // 2. MIGRATION DES UTILISATEURS
  // ==========================
  console.log('👤 Migration des utilisateurs...')
  const users = getTableData('users')
  
  for (const u of users) {
    // Mapping des rôles (Attention : Prisma attend ADMIN, AGENT, FINANCIER)
    let role: Role = Role.AGENT // Valeur par défaut
    const jsonRole = u.role.toLowerCase()
    
    if (jsonRole === 'admin') role = Role.ADMIN
    else if (jsonRole === 'agent') role = Role.AGENT
    // Si le JSON a "user", on le met en AGENT ou autre selon votre logique
    else if (jsonRole === 'user') role = Role.AGENT 

    try {
      const newUser = await prisma.user.create({
        data: {
          name: u.username,
          email: u.email,
          password: u.password, // Attention: Idéalement, il faudrait les hasher ici si ce n'est pas fait
          role: role,
          contact: "Non renseigné", // Champ obligatoire dans Prisma mais absent du JSON User
        }
      })
      // On sauvegarde la correspondance des ID
      userMap.set(u.id, newUser.id)
    } catch (e) {
      console.warn(`Skipped user ${u.email} (duplicate?)`)
    }
  }

  // ==========================
  // 3. MIGRATION DES SALLES
  // ==========================
  console.log('uwd6aa Migration des salles...')
  const salles = getTableData('salles')
  
  for (const s of salles) {
    const newSalle = await prisma.salle.create({
      data: {
        nom_salle: s.nom,
        nombre_place: 0 // Valeur par défaut car absent du JSON
      }
    })
    salleMap.set(s.id, newSalle.id)
  }

  // ==========================
  // 4. MIGRATION DES EVENEMENTS
  // ==========================
  console.log('📅 Migration des événements...')
  const evenements = getTableData('evenements')

  for (const ev of evenements) {
    // Transformation des données
    
    // a. Gestion de la date
    const dateDebut = new Date(ev.debut_date)
    const dateFin = new Date(ev.fin_date)

    // b. Gestion des montants (convertir string "150000" en float)
    const montant = parseFloat(ev.total_payer) || 0
    const avance = parseFloat(ev.tranche_1) || 0

    // c. Gestion de la salle (Le JSON a parfois "1,2" ou "3.4")
    let salleId = null
    if (ev.id_salles) {
      // On nettoie la chaine (remplace . par ,) et on prend le premier ID
      const firstId = ev.id_salles.replace('.', ',').split(',')[0]
      salleId = salleMap.get(firstId) || "f2726c94-c6f1-43cb-8c4b-9f1f1a0beda2"
    }

    // d. Gestion de l'agent
    const agentId = userMap.get(ev.id_agent) || "fa5919c5-96d7-4d5c-b1e5-dd764c2aab73"

    // e. Récupération des libellés Catégorie et Type
    const categorieNom = categorieMap.get(ev.id_categorie) || "Autre"
    const typeNom = typeMap.get(ev.id_type) || "Autre"

    // Création
    await prisma.even.create({
      data: {
        categorie: categorieNom,
        type: typeNom,
        montant: montant,
        avance: avance,
        date_debut: isNaN(dateDebut.getTime()) ? new Date() : dateDebut, // Fallback si date invalide
        date_fin: isNaN(dateFin.getTime()) ? new Date() : dateFin,
        description: ev.note || "Aucune note",
        nom_client: ev.nom_prenom,
        contact_client: ev.contact,
        
        // Relations
        salle_id: salleId,
        agent_id: agentId,
        
        // On préserve la date de création originale si possible
        createdAt: ev.date_creation ? new Date(ev.date_creation) : new Date()
      }
    })
  }

  console.log('✅ Migration terminée avec succès !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })