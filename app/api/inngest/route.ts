import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { indexRepository } from '@/features/inngest/functions'

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [indexRepository]
})