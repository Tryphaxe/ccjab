This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Billetterie Genius Pay

Les clés Genius Pay sont réservées au serveur et doivent être configurées dans l’environnement de déploiement, jamais dans le navigateur :

```env
GENIUSPAY_API_KEY=pk_sandbox_...
GENIUSPAY_API_SECRET=sk_sandbox_...
GENIUSPAY_WEBHOOK_SECRET=whsec_...
APP_URL=https://votre-domaine.example
```

En sandbox, utilisez les clés de test et configurez dans le tableau de bord Genius Pay le webhook `https://votre-domaine.example/api/webhooks/geniuspay` pour `payment.success`, `payment.failed`, `payment.cancelled`, `payment.expired` et `payment.refunded`. La migration Prisma Genius Pay doit être déployée avant l’activation des ventes. Les commandes de billets sont émises uniquement après vérification de la signature du webhook et du montant XOF reçu.

Les paiements en ligne de la billetterie sont initiés avec `payment_method: "wave"` afin de rediriger directement les acheteurs vers Wave. Le lien reçu est accepté uniquement s’il utilise HTTPS sur un domaine Wave.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
