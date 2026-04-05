const crypto = require('crypto');
const ixs = ["initialize_treasury", "lock_tokens", "unlock_tokens", "create_sale_listing", "cancel_sale_listing", "execute_sale"];
for (const ix of ixs) {
  console.log(ix + ": [" + crypto.createHash('sha256').update('global:' + ix).digest().slice(0, 8).join(', ') + "]");
}
