import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kizewqavkosvrwfnbxme.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpemV3cWF2a29zdnJ3Zm5ieG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTY0MTcsImV4cCI6MjA3NTE3MjQxN30.296FJktWIFWtvET6b_bJnyfm2m4566S5t4AxnmIGlFY' // Dashboard -> API -> anon key

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'ftnakras01@gmail.com',
    password: 'Deneme'
  })

  if (error) {
    console.error('Login error:', error)
    return
  }

  console.log('Access Token:', data.session.access_token)

  const { data: funcData, error: funcError } = await supabase.functions.invoke(
    'create-cart-checkout',
    { body: { items: [{ product_id: 'prod_1', quantity: 1 }] } }
  )

  if (funcError) {
    console.error('Function error:', funcError.message ?? funcError)

    if (funcError.context) {
      try {
        const errorBody = await funcError.context.json()
        console.error('Function error payload:', errorBody)
      } catch (parseErr) {
        console.error('Function error context parse failed:', parseErr)
      }
    }

    return
  }

  console.log('Function response:', funcData)
}

main()
