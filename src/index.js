export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/lead" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }

    try {
      if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
        return Response.json({
          success: false,
          error: "Missing Cloudflare secret",
          hasToken: Boolean(env.TELEGRAM_BOT_TOKEN),
          hasChatId: Boolean(env.TELEGRAM_CHAT_ID)
        }, { status: 500 });
      }

      const data = await request.json();

      const message =
`🔔 Нова заявка з сайту

Ім'я: ${data.name || "Не вказано"}
Телефон: ${data.phone || "Не вказано"}`;

      const response = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: message
          })
        }
      );

      const telegram = await response.json();

      if (!response.ok || !telegram.ok) {
        return Response.json({
          success: false,
          telegram
        }, { status: 502 });
      }

      return Response.json({
        success: true
      });

    } catch (error) {
      return Response.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
  }
};
