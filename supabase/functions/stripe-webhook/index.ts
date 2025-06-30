// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@10.12.0?target=deno&no-check"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const stripe = Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  httpClient: Stripe.createFetchHttpClient(),
})
const supabase = createClient(
  Deno.env.get("PROJECT_URL") ?? "",
  Deno.env.get("SERVICE_KEY") ?? ""
)

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature")
  const body = await req.text()

  let event
  try {
    event = await stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")
    )
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.client_reference_id
        const { error } = await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("id", userId)

        if (error) {
          console.error("Failed to update user subscription status:", error)
          throw error
        }
        break
      }
      // Handle other events like subscription cancellations
      case "customer.subscription.deleted": {
        const subscription = event.data.object
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", subscription.customer)
          .single()

        if (profile) {
          await supabase
            .from("profiles")
            .update({ subscription_status: "cancelled" })
            .eq("id", profile.id)
        }
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
