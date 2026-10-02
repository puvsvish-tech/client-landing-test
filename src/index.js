export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/lead" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }

    try {
      const data = await request.json();

      const lead = {
        name: data.name || "Не вказано",
        phone: data.phone || "Не вказано",
        dance: data.dance || "Не обрано",
        utm_source: data.utm_source || "",
        utm_medium: data.utm_medium || "",
        utm_campaign: data.utm_campaign || "",
        page: data.page || ""
      };

      // TELEGRAM
      const telegramMessage =
`🔔 Нова заявка з сайту

Ім'я: ${lead.name}
Телефон: ${lead.phone}
Напрям: ${lead.dance}`;

      const telegramRequest = fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: telegramMessage
          })
        }
      );

      // GOOGLE SHEETS
      const sheetsRequest = fetch(env.GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(lead)
      });

      const [telegramResponse, sheetsResponse] = await Promise.all([
        telegramRequest,
        sheetsRequest
      ]);

      const telegramResult = await telegramResponse.json();
      const sheetsResult = await sheetsResponse.json();

      if (!telegramResponse.ok || !telegramResult.ok) {
        throw new Error("Telegram error");
      }

      if (!sheetsResponse.ok || !sheetsResult.success) {
        throw new Error("Google Sheets error");
      }

      return Response.json({
        success: true
      });

    } catch (error) {
      return Response.json(
        {
          success: false,
          error: error.message
        },
        { status: 500 }
      );
    }
  }
};
