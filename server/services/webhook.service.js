export async function enviarLeadParaWebhook(lead) {
  const webhookUrl = process.env.WEBHOOK_LEADS_URL || process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    console.log("Lead recebido. Webhook não configurado.");
    return { enviado: false, motivo: "WEBHOOK_LEADS_URL não configurada" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(lead),
      signal: controller.signal
    });

    return {
      enviado: response.ok,
      status: response.status
    };
  } catch (error) {
    console.error("Erro ao enviar lead para webhook:", error.message);
    return {
      enviado: false,
      erro: error.message
    };
  } finally {
    clearTimeout(timeout);
  }
}
