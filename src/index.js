export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/lead" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }

    try {
      const data = await request.json();

      const name = data.name || "Не вказано";
      const phone = data.phone || "Не вказано";

      const message =
`🔔 Нова заявка з сайту

Ім'я: ${name}
Телефон: ${phone}`;

      const telegramResponse = await fetch(
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

      if (!telegramResponse.ok) {
        throw new Error("Telegram error");
      }

      return Response.json({
        success: true
      });

    } catch (error) {
      return Response.json(
        { success: false },
        { status: 500 }
      );
    }
  }
};
