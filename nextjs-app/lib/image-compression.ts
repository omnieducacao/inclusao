import { logger } from "@/lib/logger";

/**
 * Compressão de imagens para APIs de visão.
 * Baseado em services/hub_ia.py _comprimir_imagem_para_vision
 * 
 * IMPORTANTE: Requer a biblioteca 'sharp' instalada:
 * npm install sharp
 */

/**
 * Reduz tamanho da imagem se necessário para evitar falhas na API de visão.
 * Comprime prints de tela grandes antes de enviar para APIs de visão.
 * 
 * @param imageBuffer Buffer da imagem original
 * @param maxBytes Tamanho máximo em bytes (padrão: 3MB)
 * @returns Buffer da imagem comprimida (ou original se já estiver abaixo do limite)
 */
export async function comprimirImagemParaVision(
  imageBuffer: Buffer,
  maxBytes: number = 3_000_000
): Promise<Buffer> {
  // Se já está abaixo do limite, retorna sem processar
  if (imageBuffer.length <= maxBytes) {
    return imageBuffer;
  }

  try {
    // Tentar usar sharp (biblioteca recomendada para processamento de imagem)
    // Se não estiver instalado, retorna a imagem original com aviso
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sharp: any;
    try {
      sharp = (await import("sharp")).default;
    } catch (importErr) {
      logger.warn("sharp não está instalado. A imagem será enviada sem compressão.");
      return imageBuffer;
    }

    // Obter dimensões atuais
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    // Calcular escala baseada na razão de tamanho
    // scale = sqrt(max_bytes / current_bytes)
    // Isso mantém a proporção da imagem
    const scale = Math.sqrt(maxBytes / imageBuffer.length);

    // Calcular novas dimensões (mínimo 256px, máximo dimensão original)
    const newWidth = Math.max(256, Math.min(width, Math.floor(width * scale)));
    const newHeight = Math.max(256, Math.min(height, Math.floor(height * scale)));

    // Redimensionar e comprimir como JPEG com qualidade 85
    // Mantém proporção e não aumenta se já for menor
    const compressed = await sharp(imageBuffer)
      .resize(newWidth, newHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Verificar se a compressão foi efetiva
    if (compressed.length > imageBuffer.length) {
      // Se ficou maior, retorna a original
      return imageBuffer;
    }

    return compressed;
  } catch (err) {
    logger.error({ err }, "Erro ao comprimir imagem");
    // Em caso de erro, retorna a imagem original
    return imageBuffer;
  }
}

/**
 * Converte File/Blob para Buffer e comprime se necessário.
 * Útil para processar arquivos enviados pelo cliente.
 * 
 * @param file Arquivo de imagem
 * @param maxBytes Tamanho máximo em bytes (padrão: 3MB)
 * @returns Buffer da imagem comprimida
 */
export async function comprimirArquivoImagem(
  file: File | Blob,
  maxBytes: number = 3_000_000
): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return comprimirImagemParaVision(buffer, maxBytes);
}
