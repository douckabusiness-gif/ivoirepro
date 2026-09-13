/**
 * Utility functions for browser-side image upload, compression, and handling
 */

export async function processUploadedImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier sélectionné n\'est pas une image valide.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data URL if canvas context fails
          resolve(reader.result as string);
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with controlled quality for compact size
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Impossible de lire les données de l\'image.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors du chargement du fichier.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Prepare a storefront logo for persistence in the settings record.
 * Raster images are resized and encoded as WebP (with PNG fallback) so the
 * settings request stays small enough for the API while preserving alpha.
 * SVG files remain vector data and are kept untouched.
 */
export async function processUploadedLogo(file: File): Promise<string> {
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Lecture impossible du logo SVG.'));
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du logo SVG.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1000;
        const maxHeight = 320;
        const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Votre navigateur ne permet pas de préparer ce logo.'));
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // WebP keeps transparency and is substantially smaller than raw PNG.
        const webp = canvas.toDataURL('image/webp', 0.86);
        const png = canvas.toDataURL('image/png');
        resolve(webp.startsWith('data:image/webp') ? webp : png);
      };
      img.onerror = () => reject(new Error('Impossible de lire les données du logo.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur lors du chargement du logo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Prepare a PWA/app icon as a square PNG while preserving transparency.
 * The artwork is contained inside the square with a small safe area so it
 * remains readable when the operating system applies a mask or rounded shape.
 */
export async function processUploadedIcon(file: File, size = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier sélectionné n\'est pas une image valide.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Votre navigateur ne permet pas de préparer cette icône.'));
          return;
        }

        ctx.clearRect(0, 0, size, size);
        const safeSize = size * 0.86;
        const scale = Math.min(safeSize / img.width, safeSize / img.height);
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const x = Math.round((size - width) / 2);
        const y = Math.round((size - height) / 2);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Impossible de lire les données de l\'icône.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur lors du chargement de l\'icône.'));
    reader.readAsDataURL(file);
  });
}
