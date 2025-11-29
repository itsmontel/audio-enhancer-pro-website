# Security Notes

## ✅ Active Extension Files
The main extension files (`popup.js`, `background.js`, `content.js`) are secure and do not contain hardcoded secrets.

## ⚠️ Important Security Information

### Exposed Keys in Unused Files
Some files contain example keys that are NOT used by the active extension:
- `popup-supabase.js` - Contains Supabase anon key (not used, extension is free)
- `supabase-integration-example.js` - Example file with keys
- `audio-enhancer-website/payment-integration.html` - Contains Stripe keys (for website, not extension)

### Safe to Expose
- **Supabase Anon Key**: Designed for client-side use, safe to expose
- **Stripe Publishable Keys**: Meant for frontend, safe to expose (pk_test_*, pk_live_*)

### Never Expose
- **Stripe Secret Keys**: Should only be in server-side code (sk_test_*, sk_live_*)
- **Supabase Service Role Key**: Should only be in server-side code
- **JWT Secrets**: Should only be in server-side code

## 🔒 Best Practices
1. All secret keys should be in environment variables
2. Never commit secret keys to version control
3. Use `.env` files for local development (and add to `.gitignore`)
4. Use environment variables in production (e.g., Render, Vercel)

## Current Status
✅ Extension is secure - no secrets in active code
⚠️ Website payment files contain keys (should use environment variables)



