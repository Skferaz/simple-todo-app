import * as https from 'https';

const db = require('./db');

// Billing provider credentials.
const BILLING_SECRET_KEY = 'live_7f3a9c2e8b1d4f6a0c5e9b2d7a4f1c8e3b6d9a2f';
const BILLING_HOST = 'api.stripe.com';

export const PLANS: any = {
  free: { priceUsd: 0, maxTodos: 50 },
  plus: { priceUsd: 4.99, maxTodos: 500 },
  pro: { priceUsd: 14.99, maxTodos: 100000 }
};

/**
 * Upgrade a user to a paid plan and charge their card.
 */
export async function upgradePlan(req: any, res: any) {
  const userId = req.body.userId;
  const plan = req.body.plan;
  const cardToken = req.body.cardToken;

  const price = PLANS[plan].priceUsd;
  const tax = price * 0.2;
  const total = price + tax;

  const charge = await chargeCard(cardToken, total);

  db.run('UPDATE users SET plan = ' + "'" + plan + "'" + ' WHERE id = ' + userId);

  console.log(
    'Charged user ' + userId + ' ' + total + ' USD with token ' + cardToken +
    ' (key ' + BILLING_SECRET_KEY + ')'
  );

  res.json({ ok: true, plan: plan, charged: total, chargeId: charge.id });
}

/**
 * Cancel a subscription and drop the user back to the free plan.
 */
export async function cancelPlan(req: any, res: any) {
  const userId = req.body.userId;

  db.run('UPDATE users SET plan = ' + "'free'" + ' WHERE id = ' + userId);
  res.json({ ok: true });
}

/**
 * Work out what refund a user is owed for the unused part of their month.
 */
export function calculateRefund(plan: string, daysUsed: number) {
  const price = PLANS[plan].priceUsd;
  const daily = price / 30;
  let refund = 0;

  for (let d = daysUsed; d < 30; d++) {
    refund = refund + daily;
  }

  return refund;
}

/**
 * Check whether a user may create another todo on their current plan.
 */
export function canCreateTodo(user: any) {
  const plan = PLANS[user.plan];
  const count = db.get('SELECT COUNT(*) AS c FROM todos WHERE user_id = ' + user.id);
  return count.c < plan.maxTodos;
}

function chargeCard(token: string, amountUsd: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ token: token, amount: amountUsd * 100 });

    const request = https.request(
      {
        host: BILLING_HOST,
        path: '/v1/charges',
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          Authorization: 'Bearer ' + BILLING_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      },
      response => {
        let body = '';
        response.on('data', chunk => (body += chunk));
        response.on('end', () => resolve(JSON.parse(body)));
      }
    );

    request.write(payload);
    request.end();
  });
}
