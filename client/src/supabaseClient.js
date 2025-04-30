import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.log('SUPABASE_URL:', supabaseUrl)
  console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'exists' : 'missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test the connection
supabase.from('Artwork').select('count').then(({ data, error }) => {
  if (error) {
    console.error('Supabase initialization error:', error)
  } else {
    console.log('Supabase initialized successfully')
  }
}) 