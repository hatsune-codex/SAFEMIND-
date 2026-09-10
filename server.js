require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const VIRUSTOTAL_API = "https://www.virustotal.com/api/v3";

app.use(cors());
app.use(express.json());

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function virusTotalRequest(path, options = {}) {
    const response = await fetch(`${VIRUSTOTAL_API}${path}`, {
        ...options,
        headers: {
            "x-apikey": process.env.VT_API_KEY,
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`VirusTotal respondió ${response.status}: ${details}`);
    }

    return response.json();
}

async function waitForAnalysis(analysisId) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
        const analysis = await virusTotalRequest(`/analyses/${encodeURIComponent(analysisId)}`);
        const status = analysis.data?.attributes?.status;

        if (status === "completed") {
            return analysis.data.attributes;
        }

        if (status === "failed") {
            throw new Error("VirusTotal no pudo completar el análisis.");
        }

        await wait(10000);
    }

    const timeoutError = new Error("El análisis de VirusTotal está tardando demasiado. Inténtalo de nuevo.");
    timeoutError.code = "ANALYSIS_TIMEOUT";
    timeoutError.analysisId = analysisId;
    throw timeoutError;
}

async function getUrlReport(urlId) {
    const report = await virusTotalRequest(`/urls/${urlId}`);
    return report.data?.attributes;
}

app.post("/api/check-url", async (req, res) => {
    const value = typeof req.body?.url === "string" ? req.body.url.trim() : "";

    if (!value) {
        return res.status(400).json({ error: "Debes proporcionar una URL." });
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(value);
    } catch {
        return res.status(400).json({ error: "La URL no tiene un formato válido." });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: "Solo se permiten URLs http o https." });
    }

    if (value.length > 2048) {
        return res.status(400).json({ error: "La URL supera el límite de 2048 caracteres." });
    }

    if (!process.env.VT_API_KEY || process.env.VT_API_KEY === "mi_clave_aqui") {
        return res.status(500).json({ error: "Configura una clave válida en el archivo .env." });
    }

    try {
        const submission = await virusTotalRequest("/urls", {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ url: value })
        });

        const analysisId = submission.data?.id;
        if (!analysisId) {
            throw new Error("VirusTotal no devolvió un identificador de análisis.");
        }

        const urlId = Buffer.from(value).toString("base64url");
        let analysis;

        try {
            analysis = await waitForAnalysis(analysisId);
        } catch (error) {
            if (error.code !== "ANALYSIS_TIMEOUT") {
                throw error;
            }

            const report = await getUrlReport(urlId);
            if (!report?.last_analysis_stats) {
                throw error;
            }

            analysis = {
                status: "completed",
                stats: report.last_analysis_stats
            };
        }

        const stats = analysis.stats || {};

        return res.json({
            url: value,
            analysisId,
            urlId,
            virustotalUrl: `https://www.virustotal.com/gui/url/${urlId}/detection`,
            status: analysis.status,
            stats: {
                malicious: stats.malicious || 0,
                suspicious: stats.suspicious || 0,
                harmless: stats.harmless || 0
            }
        });
    } catch (error) {
        console.error("Error al consultar VirusTotal:", error.message);
        const response = { error: `VirusTotal no pudo analizar la URL: ${error.message}` };
        if (error.analysisId) {
            const urlId = Buffer.from(value).toString("base64url");
            response.analysisId = error.analysisId;
            response.virustotalUrl = `https://www.virustotal.com/gui/url/${urlId}/detection`;
        }
        return res.status(error.code === "ANALYSIS_TIMEOUT" ? 504 : 502).json(response);
    }
});

app.listen(PORT, () => {
    console.log(`SafeMind backend escuchando en http://localhost:${PORT}`);
});
