import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const isAdmin = await getAdminSession()
  if (!isAdmin) redirect('/admin/login')

  const supabase = createServiceClient()
  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })

  return <DashboardClient collections={collections || []} />
}
