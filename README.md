This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


================================================================================================================================


frontend/
├── public/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── pipeline/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── follow-ups/
│   │   │   │   ├── page.tsx
│   │   │   │   └── calendar/
│   │   │   │       └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx
│   │   │   │   └── kanban/
│   │   │   │       └── page.tsx
│   │   │   ├── quotations/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── ai-assistant/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                        ← shadcn components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MobilNav.tsx
│   │   │   └── PageWrapper.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── LeadPipelineChart.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── AIRecommendations.tsx
│   │   ├── customers/
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   └── CustomerCard.tsx
│   │   ├── leads/
│   │   │   ├── LeadTable.tsx
│   │   │   ├── LeadForm.tsx
│   │   │   ├── LeadCard.tsx
│   │   │   ├── PipelineBoard.tsx
│   │   │   └── LeadScoreBadge.tsx
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── KanbanBoard.tsx
│   │   ├── follow-ups/
│   │   │   ├── FollowUpCard.tsx
│   │   │   ├── FollowUpForm.tsx
│   │   │   └── FollowUpCalendar.tsx
│   │   ├── quotations/
│   │   │   ├── QuotationForm.tsx
│   │   │   └── QuotationPreview.tsx
│   │   ├── invoices/
│   │   │   ├── InvoiceForm.tsx
│   │   │   └── InvoicePreview.tsx
│   │   ├── analytics/
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── LeadSourceChart.tsx
│   │   │   └── ConversionChart.tsx
│   │   └── ai/
│   │       ├── EmailGenerator.tsx
│   │       ├── ProposalGenerator.tsx
│   │       ├── AISalesAssistant.tsx
│   │       └── LeadScoreCard.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLeads.ts
│   │   ├── useCustomers.ts
│   │   ├── useTasks.ts
│   │   ├── useFollowUps.ts
│   │   ├── useInvoices.ts
│   │   ├── useQuotations.ts
│   │   ├── useAnalytics.ts
│   │   └── useSocket.ts
│   ├── lib/
│   │   ├── api.ts                     ← axios instance
│   │   ├── ai-api.ts                  ← fastapi calls
│   │   ├── utils.ts
│   │   └── validators.ts
│   ├── store/
│   │   └── authStore.ts               ← zustand
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── customer.types.ts
│   │   ├── lead.types.ts
│   │   ├── task.types.ts
│   │   ├── invoice.types.ts
│   │   ├── quotation.types.ts
│   │   └── analytics.types.ts
│   └── constants/
│       ├── routes.ts
│       └── config.ts
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── Dockerfile
└── package.json

================================================================================================================================