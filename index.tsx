/* tslint:disable */
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI, Modality, Type} from '@google/genai';

// Fix: Define and use AIStudio interface for window.aistudio to resolve type conflict.
// Define the aistudio property on the window object for TypeScript
declare global {
  interface AIStudio {
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

async function openApiKeyDialog() {
  if (window.aistudio?.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    // This provides a fallback for environments where the dialog isn't available
    showStatusError(
      'API 密钥选择不可用。请配置 API_KEY 环境变量。',
    );
  }
}

// --- Helper Functions ---
function fileToGenerativePart(file: File): Promise<{
  inlineData: {
    data: string;
    mimeType: string;
  };
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = (event.target?.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  });
}

async function base64ToFile(
  base64: string,
  filename: string,
  mimeType: string,
): Promise<File> {
  const res = await fetch(`data:${mimeType};base64,${base64}`);
  const blob = await res.blob();
  return new File([blob], filename, {type: mimeType});
}

// --- DOM Element Selection ---
const productUploadEl = document.querySelector(
  '#product-upload',
) as HTMLInputElement;
const sceneUploadEl = document.querySelector('#scene-upload') as HTMLInputElement;
const productPreviewEl = document.querySelector(
  '#product-preview',
) as HTMLImageElement;
const scenePreviewEl = document.querySelector(
  '#scene-preview',
) as HTMLImageElement;
const productPlaceholderEl = document.querySelector(
  '#product-placeholder',
) as HTMLDivElement;
const scenePlaceholderEl = document.querySelector(
  '#scene-placeholder',
) as HTMLDivElement;
const productPreviewContainer = document.querySelector(
  '#product-preview-container',
) as HTMLDivElement;
const scenePreviewContainer = document.querySelector(
  '#scene-preview-container',
) as HTMLDivElement;
const removeBackgroundButton = document.querySelector(
  '#remove-background-button',
) as HTMLButtonElement;
const editMaskButton = document.querySelector(
  '#edit-mask-button',
) as HTMLButtonElement;
const outlineButton = document.querySelector(
  '#outline-button',
) as HTMLButtonElement;
const productOutlineCanvas = document.querySelector(
  '#product-outline-canvas',
) as HTMLCanvasElement;
const outlineInfoEl = document.querySelector(
  '#outline-info',
) as HTMLParagraphElement;
const maskPreviewContainerEl = document.querySelector(
  '#mask-preview-container',
) as HTMLDivElement;
const maskPreviewEl = document.querySelector(
  '#mask-preview',
) as HTMLImageElement;
const maskScaleContainerEl = document.querySelector(
  '#mask-scale-container',
) as HTMLDivElement;
const maskScaleSliderEl = document.querySelector(
  '#mask-scale-slider',
) as HTMLInputElement;
const maskScaleValueEl = document.querySelector(
  '#mask-scale-value',
) as HTMLSpanElement;

const promptEl = document.querySelector('#prompt-input') as HTMLTextAreaElement;
const suggestedPromptsContainerEl = document.querySelector(
  '#suggested-prompts-container',
) as HTMLDivElement;
const generateButton = document.querySelector(
  '#generate-button',
) as HTMLButtonElement;
const outputImage = document.querySelector('#output-image') as HTMLImageElement;
const outputPlaceholderEl = document.querySelector(
  '#output-placeholder',
) as HTMLDivElement;
const statusEl = document.querySelector('#status') as HTMLDivElement;
const loaderEl = document.querySelector('#loader') as HTMLDivElement;
const outputActionsEl = document.querySelector(
  '#output-actions',
) as HTMLDivElement;
const regenerateButton = document.querySelector(
  '#regenerate-button',
) as HTMLButtonElement;
const downloadButton = document.querySelector(
  '#download-button',
) as HTMLButtonElement;
const tuneButton = document.querySelector('#tune-button') as HTMLButtonElement;

// Migration Mode Elements
const modeProductToSceneButton = document.querySelector(
  '#mode-product-to-scene',
) as HTMLButtonElement;
const modeSceneToProductButton = document.querySelector(
  '#mode-scene-to-product',
) as HTMLButtonElement;

// Quality Settings Elements
const qualityButtons = document.querySelectorAll(
  '.quality-button',
) as NodeListOf<HTMLButtonElement>;
const seedInputEl = document.querySelector('#seed-input') as HTMLInputElement;

// Fine-tune Modal Elements
const tuneModalEl = document.querySelector('#tune-modal') as HTMLDivElement;
const tuneModalCloseButton = document.querySelector(
  '#tune-modal-close',
) as HTMLButtonElement;
const tuneImageEl = document.querySelector('#tune-image') as HTMLImageElement;
const tunePromptEl = document.querySelector(
  '#tune-prompt',
) as HTMLTextAreaElement;
const tuneCancelButton = document.querySelector(
  '#tune-cancel-button',
) as HTMLButtonElement;
const tuneApplyButton = document.querySelector(
  '#tune-apply-button',
) as HTMLButtonElement;
const tuneLoaderEl = document.querySelector('#tune-loader') as HTMLDivElement;

// History Modal Elements
const historyButton = document.querySelector(
  '#history-button',
) as HTMLButtonElement;
const historyModalEl = document.querySelector(
  '#history-modal',
) as HTMLDivElement;
const historyModalCloseButton = document.querySelector(
  '#history-modal-close',
) as HTMLButtonElement;
const historyItemsContainerEl = document.querySelector(
  '#history-items-container',
) as HTMLDivElement;
const historyEmptyMessageEl = document.querySelector(
  '#history-empty-message',
) as HTMLParagraphElement;

// Mask Editor Modal Elements
const maskEditorModalEl = document.querySelector(
  '#mask-editor-modal',
) as HTMLDivElement;
const maskEditorCanvasEl = document.querySelector(
  '#mask-editor-canvas',
) as HTMLCanvasElement;
const maskEditorCloseButton = document.querySelector(
  '#mask-editor-close',
) as HTMLButtonElement;
const maskEditorCancelButton = document.querySelector(
  '#mask-editor-cancel',
) as HTMLButtonElement;
const maskEditorSaveButton = document.querySelector(
  '#mask-editor-save',
) as HTMLButtonElement;

// Lightbox Modal Elements
const lightboxModalEl = document.querySelector(
  '#lightbox-modal',
) as HTMLDivElement;
const lightboxImageEl = document.querySelector(
  '#lightbox-image',
) as HTMLImageElement;
const lightboxCloseButton = document.querySelector(
  '#lightbox-close',
) as HTMLButtonElement;

// Fidelity Feedback Elements
const feedbackContainerEl = document.querySelector(
  '#feedback-container',
) as HTMLDivElement;
const feedbackListEl = document.querySelector('#feedback-list') as HTMLUListElement;
const feedbackInputEl = document.querySelector(
  '#feedback-input',
) as HTMLInputElement;
const saveFeedbackButton = document.querySelector(
  '#save-feedback-button',
) as HTMLButtonElement;

// --- State Variables ---
type OutlinePoint = {x: number; y: number};
type MigrationMode = 'product-to-scene' | 'scene-to-product';
type QualitySetting = 'fast' | 'balanced' | 'high-quality';
let productFile: File | null = null;
let sceneFile: File | null = null;
let promptText = '';
let currentOutputImageData: {data: string; mimeType: string} | null = null;
let generationHistory: {data: string; mimeType: string}[] = [];
let productOutlineCoordinates: OutlinePoint[] | null = null;
let productMaskData: {data: string; mimeType: string} | null = null;
let editedProductMaskData: {data: string; mimeType: string} | null = null;
let migrationMode: MigrationMode = 'product-to-scene';
let qualitySetting: QualitySetting = 'balanced';
let seedValue: number | null = null;
let productFidelityFeedback: string[] = [];
let productMaskScale = 1.0;
let preserveHumanInProduct = false;
let lightboxScale = 1;
let lightboxTranslate = {x: 0, y: 0};
let isPanning = false;
let panStart = {x: 0, y: 0};

// --- Local Storage ---
const SETTINGS_STORAGE_KEY = 'thingMigrationSettings';

function saveSettingsToLocalStorage() {
  const settings = {
    migrationMode,
    qualitySetting,
    seedValue,
    promptText,
    productFidelityFeedback,
  };
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function loadSettingsFromLocalStorage() {
  try {
    const savedSettingsJSON = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettingsJSON) {
      const savedSettings = JSON.parse(savedSettingsJSON);

      // Load and apply prompt
      if (typeof savedSettings.promptText === 'string') {
        promptText = savedSettings.promptText;
        promptEl.value = promptText;
      }

      // Load and apply migration mode
      if (
        savedSettings.migrationMode === 'product-to-scene' ||
        savedSettings.migrationMode === 'scene-to-product'
      ) {
        // Use the existing function which handles both state and UI
        setMigrationMode(savedSettings.migrationMode);
      }

      // Load and apply quality setting
      if (
        ['fast', 'balanced', 'high-quality'].includes(
          savedSettings.qualitySetting,
        )
      ) {
        qualitySetting = savedSettings.qualitySetting;
        qualityButtons.forEach((button) => {
          const isSelected = button.dataset.quality === qualitySetting;
          button.classList.toggle('bg-blue-600', isSelected);
          button.classList.toggle('text-white', isSelected);
          button.classList.toggle('text-gray-400', !isSelected);
        });
      }

      // Load and apply seed value
      if (typeof savedSettings.seedValue === 'number') {
        seedValue = savedSettings.seedValue;
        seedInputEl.value = String(seedValue);
      } else {
        seedValue = null;
        seedInputEl.value = '';
      }

      // Load and apply fidelity feedback
      if (
        Array.isArray(savedSettings.productFidelityFeedback) &&
        savedSettings.productFidelityFeedback.every(
          (item: unknown) => typeof item === 'string',
        )
      ) {
        productFidelityFeedback = savedSettings.productFidelityFeedback;
        renderSavedFeedback();
      }
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage:', e);
    // Clear corrupted settings
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  }
}

// --- Centralized File Handler ---
async function handleFile(file: File | null, type: 'product' | 'scene') {
  if (!file || !file.type.startsWith('image/')) {
    showStatusError('请提供有效的图像文件。');
    return;
  }

  if (type === 'product') {
    productFile = file;
    productPreviewEl.src = URL.createObjectURL(file);
    productPreviewEl.classList.remove('hidden');
    productPlaceholderEl.classList.add('hidden');
    outlineButton.classList.remove('hidden');
    removeBackgroundButton.classList.remove('hidden');
    removeBackgroundButton.disabled = false;
    removeBackgroundButton.textContent = '隔离产品';
    editMaskButton.classList.add('hidden');
    outlineInfoEl.classList.add('hidden');
    maskPreviewContainerEl.classList.add('hidden');

    // Clear previous generated data
    productOutlineCoordinates = null;
    productMaskData = null;
    editedProductMaskData = null;
    productMaskScale = 1.0;
    preserveHumanInProduct = false;
    maskScaleSliderEl.value = '100';
    maskScaleValueEl.textContent = '100%';
    updateMaskScaleControlVisibility();
    const ctx = productOutlineCanvas.getContext('2d');
    ctx?.clearRect(
      0,
      0,
      productOutlineCanvas.width,
      productOutlineCanvas.height,
    );
    // When a new product is uploaded, reset prompts to default
    renderSuggestedPrompts(DEFAULT_SUGGESTED_PROMPTS);
  } else {
    sceneFile = file;
    scenePreviewEl.src = URL.createObjectURL(file);
    scenePreviewEl.classList.remove('hidden');
    scenePlaceholderEl.classList.add('hidden');
  }
  validateInputs();

  // After validation, check if we can run the combined analysis
  if (productFile && sceneFile) {
    runCombinedAnalysis();
  }
}

// --- Event Listeners ---
productUploadEl.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  handleFile(file, 'product');
});

sceneUploadEl.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  handleFile(file, 'scene');
});

promptEl.addEventListener('input', () => {
  promptText = promptEl.value;
  saveSettingsToLocalStorage();
});

generateButton.addEventListener('click', () => {
  migrate();
});

regenerateButton.addEventListener('click', () => {
  migrate();
});

downloadButton.addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = outputImage.src;
  link.download = 'migrated-image.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

removeBackgroundButton.addEventListener('click', async () => {
  if (!productFile) return;

  removeBackgroundButton.disabled = true;
  editMaskButton.classList.add('hidden');
  removeBackgroundButton.textContent = '隔离中...';
  showStatusMessage('正在隔离产品并创建蒙版...');

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      showStatusError('API 密钥未配置。');
      await openApiKeyDialog();
      removeBackgroundButton.textContent = '隔离产品';
      removeBackgroundButton.disabled = false;
      return;
    }

    const {product: imageData, mask: maskData} =
      await isolateProductAndCreateMask(apiKey, productFile);

    const newFile = await base64ToFile(
      imageData.data,
      'product-no-bg.png',
      imageData.mimeType,
    );
    productFile = newFile; // Update the global product file
    productPreviewEl.src = URL.createObjectURL(newFile);

    // Also process the mask
    productMaskData = maskData;
    editedProductMaskData = null; // Clear any previous edits
    maskPreviewEl.src = `data:${maskData.mimeType};base64,${maskData.data}`;
    maskPreviewContainerEl.classList.remove('hidden');
    editMaskButton.classList.remove('hidden');
    editMaskButton.disabled = false;
    updateMaskScaleControlVisibility();

    // Clear any previous outline as the image has changed
    productOutlineCoordinates = null;
    const ctx = productOutlineCanvas.getContext('2d');
    ctx?.clearRect(
      0,
      0,
      productOutlineCanvas.width,
      productOutlineCanvas.height,
    );
    outlineInfoEl.classList.add('hidden');
    outlineButton.textContent = '勾勒产品轮廓';

    showStatusMessage('产品隔离和蒙版创建成功。');
    removeBackgroundButton.textContent = '产品已隔离';

    // Rerun analysis if scene file exists
    if (sceneFile) {
      runCombinedAnalysis();
    }
  } catch (e) {
    handleApiError(e);
    removeBackgroundButton.textContent = '隔离产品';
    removeBackgroundButton.disabled = false; // Re-enable on failure
  }
});

outlineButton.addEventListener('click', async () => {
  if (!productFile) return;

  outlineButton.disabled = true;
  outlineButton.textContent = '勾勒中...';
  const ctx = productOutlineCanvas.getContext('2d');
  ctx?.clearRect(
    0,
    0,
    productOutlineCanvas.width,
    productOutlineCanvas.height,
  );
  showStatusMessage('正在生成产品轮廓和蒙版...');

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      showStatusError('API 密钥未配置。');
      await openApiKeyDialog();
      outlineButton.textContent = '勾勒产品轮廓';
      outlineButton.disabled = false;
      return;
    }

    const {outline, mask} = await generateProductOutline(apiKey, productFile);

    // Store results
    productOutlineCoordinates = outline;
    productMaskData = mask; // Overwrite/set the main mask data
    editedProductMaskData = null; // Clear any previous edits

    await drawOutline(outline);

    // Update UI with the new mask
    maskPreviewEl.src = `data:${mask.mimeType};base64,${mask.data}`;
    maskPreviewContainerEl.classList.remove('hidden');
    editMaskButton.classList.remove('hidden');
    editMaskButton.disabled = false;
    updateMaskScaleControlVisibility();

    showStatusMessage('产品轮廓和精确蒙版已生成。');
    outlineButton.textContent = '重新勾勒';
    outlineInfoEl.classList.remove('hidden');
  } catch (e) {
    handleApiError(e);
    outlineButton.textContent = '勾勒产品轮廓';
  } finally {
    outlineButton.disabled = false;
  }
});

// Drag and Drop Listeners
const setupDragDrop = (
  container: HTMLDivElement,
  type: 'product' | 'scene',
) => {
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    container.classList.add('border-blue-500', 'bg-[#3d3f42]');
  });
  container.addEventListener('dragleave', (e) => {
    e.preventDefault();
    container.classList.remove('border-blue-500', 'bg-[#3d3f42]');
  });
  container.addEventListener('drop', (e) => {
    e.preventDefault();
    container.classList.remove('border-blue-500', 'bg-[#3d3f42]');
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFile(file, type);
    }
  });
};

setupDragDrop(productPreviewContainer, 'product');
setupDragDrop(scenePreviewContainer, 'scene');

// Paste from Clipboard Listener
window.addEventListener('paste', (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  let imageFile: File | null = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      imageFile = items[i].getAsFile();
      break;
    }
  }

  if (imageFile) {
    // Prioritize filling the first empty slot
    if (!productFile) {
      handleFile(imageFile, 'product');
    } else if (!sceneFile) {
      handleFile(imageFile, 'scene');
    }
  }
});

// --- Migration Mode Listener ---
function setMigrationMode(mode: MigrationMode) {
  migrationMode = mode;
  if (mode === 'product-to-scene') {
    modeProductToSceneButton.classList.add('bg-blue-600', 'text-white');
    modeProductToSceneButton.classList.remove('text-gray-400');
    modeSceneToProductButton.classList.remove('bg-blue-600', 'text-white');
    modeSceneToProductButton.classList.add('text-gray-400');
  } else {
    modeSceneToProductButton.classList.add('bg-blue-600', 'text-white');
    modeSceneToProductButton.classList.remove('text-gray-400');
    modeProductToSceneButton.classList.remove('bg-blue-600', 'text-white');
    modeProductToSceneButton.classList.add('text-gray-400');
  }
  updateMaskScaleControlVisibility();
  saveSettingsToLocalStorage();
}
modeProductToSceneButton.addEventListener('click', () =>
  setMigrationMode('product-to-scene'),
);
modeSceneToProductButton.addEventListener('click', () =>
  setMigrationMode('scene-to-product'),
);

// --- Quality & Seed Listeners ---
qualityButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedQuality = button.dataset.quality as QualitySetting;
    qualitySetting = selectedQuality;

    // Update button styles
    qualityButtons.forEach((btn) => {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('text-gray-400');
    });
    button.classList.add('bg-blue-600', 'text-white');
    button.classList.remove('text-gray-400');
    saveSettingsToLocalStorage();
  });
});

seedInputEl.addEventListener('input', () => {
  const val = parseInt(seedInputEl.value, 10);
  seedValue = isNaN(val) ? null : val;
  saveSettingsToLocalStorage();
});

// --- Fine-tuning Modal Listeners ---
tuneButton.addEventListener('click', () => {
  tuneImageEl.src = outputImage.src;
  tuneModalEl.classList.remove('hidden');
});

tuneModalCloseButton.addEventListener('click', () =>
  tuneModalEl.classList.add('hidden'),
);
tuneCancelButton.addEventListener('click', () =>
  tuneModalEl.classList.add('hidden'),
);

tuneApplyButton.addEventListener('click', async () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || !currentOutputImageData) return;

  const tuningPrompt = tunePromptEl.value.trim();
  if (!tuningPrompt) {
    alert('请输入一些微调指令。');
    return;
  }

  tuneLoaderEl.classList.remove('hidden');
  tuneApplyButton.disabled = true;
  tuneCancelButton.disabled = true;

  try {
    const tunedImageData = await tuneImage(
      apiKey,
      currentOutputImageData.data,
      currentOutputImageData.mimeType,
      tuningPrompt,
    );

    currentOutputImageData = tunedImageData;
    generationHistory.unshift(tunedImageData); // Add to history
    updateHistoryButtonState();

    const newImageUrl = `data:${tunedImageData.mimeType};base64,${tunedImageData.data}`;
    outputImage.src = newImageUrl;
    tuneImageEl.src = newImageUrl;
    tunePromptEl.value = ''; // Clear prompt for next instruction
  } catch (e) {
    handleApiError(e);
  } finally {
    tuneLoaderEl.classList.add('hidden');
    tuneApplyButton.disabled = false;
    tuneCancelButton.disabled = false;
  }
});

// --- History Modal Listeners ---
historyButton.addEventListener('click', () => {
  renderHistory();
  historyModalEl.classList.remove('hidden');
});

historyModalCloseButton.addEventListener('click', () => {
  historyModalEl.classList.add('hidden');
});

// --- Mask Editor Listeners & Functions ---
editMaskButton.addEventListener('click', () => {
  openMaskEditor();
});
maskEditorCloseButton.addEventListener('click', () => {
  maskEditorModalEl.classList.add('hidden');
});
maskEditorCancelButton.addEventListener('click', () => {
  maskEditorModalEl.classList.add('hidden');
});

maskScaleSliderEl.addEventListener('input', () => {
  const scaleValue = parseInt(maskScaleSliderEl.value, 10);
  productMaskScale = scaleValue / 100.0;
  maskScaleValueEl.textContent = `${scaleValue}%`;
});

async function openMaskEditor() {
  if (!productFile || !productMaskData) return;

  maskEditorModalEl.classList.remove('hidden');

  const productImg = new Image();
  const maskImg = new Image();
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d', {
    willReadFrequently: true,
  });
  const visibleCtx = maskEditorCanvasEl.getContext('2d');

  if (!visibleCtx || !offscreenCtx) return;

  // Load both images
  const productPromise = new Promise<void>((res) => {
    productImg.onload = () => res();
    productImg.src = URL.createObjectURL(productFile!);
  });
  const maskPromise = new Promise<void>((res) => {
    maskImg.onload = () => res();
    maskImg.src = `data:${productMaskData!.mimeType};base64,${
      productMaskData!.data
    }`;
  });

  await Promise.all([productPromise, maskPromise]);

  // Setup canvases
  const w = productImg.naturalWidth;
  const h = productImg.naturalHeight;
  maskEditorCanvasEl.width = w;
  maskEditorCanvasEl.height = h;
  offscreenCanvas.width = w;
  offscreenCanvas.height = h;

  // Load the initial (unedited) mask to the offscreen canvas
  offscreenCtx.drawImage(maskImg, 0, 0);

  let isDrawing = false;

  const redraw = () => {
    visibleCtx.clearRect(0, 0, w, h);
    // Draw the product image first
    visibleCtx.drawImage(productImg, 0, 0);
    // Draw the mask from the offscreen canvas as a red overlay
    visibleCtx.globalCompositeOperation = 'source-atop';
    visibleCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    visibleCtx.drawImage(offscreenCanvas, 0, 0);
    visibleCtx.fillRect(0, 0, w, h);
    visibleCtx.globalCompositeOperation = 'source-over'; // Reset
  };

  const erase = (e: MouseEvent) => {
    if (!isDrawing) return;
    const rect = maskEditorCanvasEl.getBoundingClientRect();
    const scaleX = maskEditorCanvasEl.width / rect.width;
    const scaleY = maskEditorCanvasEl.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Erase on the offscreen canvas (draw black)
    offscreenCtx.fillStyle = 'black';
    offscreenCtx.beginPath();
    offscreenCtx.arc(x, y, 20, 0, Math.PI * 2); // 20px radius eraser
    offscreenCtx.fill();
    redraw();
  };

  maskEditorCanvasEl.onmousedown = (e) => {
    isDrawing = true;
    erase(e);
  };
  maskEditorCanvasEl.onmousemove = erase;
  maskEditorCanvasEl.onmouseup = () => (isDrawing = false);
  maskEditorCanvasEl.onmouseleave = () => (isDrawing = false);

  maskEditorSaveButton.onclick = () => {
    const newMaskDataUrl = offscreenCanvas.toDataURL('image/png');
    const newMaskBase64 = newMaskDataUrl.split(',')[1];
    editedProductMaskData = {
      data: newMaskBase64,
      mimeType: 'image/png',
    };
    // Update the small preview
    maskPreviewEl.src = newMaskDataUrl;
    showStatusMessage('蒙版编辑成功。');
    maskEditorModalEl.classList.add('hidden');
    updateMaskScaleControlVisibility();
  };

  redraw(); // Initial draw
}

// --- Lightbox Listeners & Functions ---
function applyLightboxTransform() {
  // Prevent panning when not zoomed in
  if (lightboxScale <= 1) {
    lightboxTranslate = {x: 0, y: 0};
  }
  // Set origin to top-left for consistent calculations and apply transforms.
  // By applying translate first, the translation values are simple screen-space pixels,
  // which makes the zoom-to-cursor and panning math straightforward and correct.
  lightboxImageEl.style.transformOrigin = '0 0';
  lightboxImageEl.style.transform = `translate(${lightboxTranslate.x}px, ${lightboxTranslate.y}px) scale(${lightboxScale})`;

  // Update cursor based on zoom level
  if (lightboxScale > 1) {
    lightboxImageEl.classList.add('cursor-grab');
  } else {
    lightboxImageEl.classList.remove('cursor-grab', 'cursor-grabbing');
  }
}

function openLightbox() {
  lightboxImageEl.src = outputImage.src;
  lightboxModalEl.classList.remove('hidden');
  // Trigger transition
  setTimeout(() => {
    lightboxModalEl.classList.remove('opacity-0');
  }, 10);
}

function closeLightbox() {
  lightboxModalEl.classList.add('opacity-0');
  setTimeout(() => {
    lightboxModalEl.classList.add('hidden');
    // Reset state after hiding to prevent visual snap on next open
    lightboxScale = 1;
    lightboxTranslate = {x: 0, y: 0};
    isPanning = false;
    applyLightboxTransform();
  }, 300); // Match transition duration
}

outputImage.addEventListener('click', () => {
  // Only open lightbox if there's an image
  if (outputImage.src && !outputImage.classList.contains('hidden')) {
    openLightbox();
  }
});
lightboxCloseButton.addEventListener('click', closeLightbox);
lightboxModalEl.addEventListener('click', (e) => {
  if (e.target === lightboxModalEl) {
    closeLightbox();
  }
});

lightboxImageEl.addEventListener('wheel', (e) => {
  e.preventDefault();

  const zoomSpeed = 0.1;
  const oldScale = lightboxScale;

  // Calculate new scale
  if (e.deltaY < 0) {
    lightboxScale = Math.min(8, lightboxScale * (1 + zoomSpeed)); // Max zoom 8x
  } else {
    lightboxScale = Math.max(1, lightboxScale * (1 - zoomSpeed)); // Min zoom 1x (no zoom out past original size)
  }

  const rect = lightboxImageEl.getBoundingClientRect();

  // Position of the mouse relative to the image element's top-left corner
  const mouseOnElementX = e.clientX - rect.left;
  const mouseOnElementY = e.clientY - rect.top;

  // The new translation required to keep the point under the mouse stationary
  const newTx =
    mouseOnElementX -
    (mouseOnElementX - lightboxTranslate.x) * (lightboxScale / oldScale);
  const newTy =
    mouseOnElementY -
    (mouseOnElementY - lightboxTranslate.y) * (lightboxScale / oldScale);

  lightboxTranslate.x = newTx;
  lightboxTranslate.y = newTy;

  applyLightboxTransform();
});

lightboxImageEl.addEventListener('mousedown', (e) => {
  if (lightboxScale <= 1) return; // Only allow panning when zoomed
  e.preventDefault();
  isPanning = true;
  panStart = {
    x: e.clientX - lightboxTranslate.x,
    y: e.clientY - lightboxTranslate.y,
  };
  lightboxImageEl.classList.remove('cursor-grab');
  lightboxImageEl.classList.add('cursor-grabbing');
});

// Use window for move and up events for a better drag experience
window.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  e.preventDefault();
  lightboxTranslate.x = e.clientX - panStart.x;
  lightboxTranslate.y = e.clientY - panStart.y;
  applyLightboxTransform();
});

window.addEventListener('mouseup', () => {
  if (isPanning) {
    isPanning = false;
    lightboxImageEl.classList.remove('cursor-grabbing');
    lightboxImageEl.classList.add('cursor-grab');
  }
});

// --- Fidelity Feedback Listeners ---
saveFeedbackButton.addEventListener('click', () => {
  const feedbackText = feedbackInputEl.value.trim();
  if (feedbackText) {
    productFidelityFeedback.push(feedbackText);
    saveSettingsToLocalStorage();
    renderSavedFeedback();
    feedbackInputEl.value = '';
  }
});

// --- Functions ---
function validateInputs() {
  generateButton.disabled = !(productFile && sceneFile);
}

function showStatusError(message: string) {
  statusEl.innerHTML = `<span class="text-red-400">${message}</span>`;
  statusEl.classList.remove('hidden');
}

function showStatusMessage(message: string) {
  statusEl.innerHTML = `<span class="text-gray-400">${message}</span>`;
  statusEl.classList.remove('hidden');
}

function setControlsDisabled(disabled: boolean) {
  generateButton.disabled = disabled;
  promptEl.disabled = disabled;
  productUploadEl.disabled = disabled;
  sceneUploadEl.disabled = disabled;
  outlineButton.disabled = disabled;
  removeBackgroundButton.disabled = disabled;
  editMaskButton.disabled = disabled;
  qualityButtons.forEach((btn) => (btn.disabled = disabled));
  seedInputEl.disabled = disabled;
}

function updateHistoryButtonState() {
  historyButton.disabled = generationHistory.length === 0;
}

function updateMaskScaleControlVisibility() {
  const isVisible =
    migrationMode === 'product-to-scene' &&
    (productMaskData || editedProductMaskData);
  maskScaleContainerEl.classList.toggle('hidden', !isVisible);
}

function renderSavedFeedback() {
  feedbackListEl.innerHTML = ''; // Clear existing
  if (productFidelityFeedback.length === 0) {
    const placeholder = document.createElement('p');
    placeholder.textContent = '暂未保存反馈规则。';
    placeholder.className = 'text-xs text-gray-500 italic';
    feedbackListEl.appendChild(placeholder);
  } else {
    productFidelityFeedback.forEach((feedback, index) => {
      const li = document.createElement('li');
      li.className =
        'flex justify-between items-center text-xs bg-[#2a2b2e] p-1.5 rounded';
      const text = document.createElement('span');
      text.textContent = feedback;
      text.className = 'text-gray-300';

      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '&times;';
      deleteButton.className =
        'font-bold text-lg text-gray-500 hover:text-white leading-none px-2';
      deleteButton.setAttribute('aria-label', 'Delete feedback');
      deleteButton.onclick = () => {
        productFidelityFeedback.splice(index, 1);
        saveSettingsToLocalStorage();
        renderSavedFeedback(); // Re-render the list
      };

      li.appendChild(text);
      li.appendChild(deleteButton);
      feedbackListEl.appendChild(li);
    });
  }
}

function renderHistory() {
  historyItemsContainerEl.innerHTML = ''; // Clear previous items

  if (generationHistory.length === 0) {
    historyItemsContainerEl.appendChild(historyEmptyMessageEl);
    historyEmptyMessageEl.classList.remove('hidden');
    return;
  }

  historyEmptyMessageEl.classList.add('hidden');

  generationHistory.forEach((imageData, index) => {
    const imgEl = document.createElement('img');
    imgEl.src = `data:${imageData.mimeType};base64,${imageData.data}`;
    imgEl.alt = `生成的图像 ${index + 1}`;
    imgEl.className =
      'w-full h-full object-cover rounded-md cursor-pointer aspect-square transition-transform duration-200 hover:scale-105 hover:ring-2 ring-blue-500';
    imgEl.dataset.index = String(index);

    imgEl.addEventListener('click', () => {
      const selectedIndex = parseInt(imgEl.dataset.index!, 10);
      const selectedImageData = generationHistory[selectedIndex];

      currentOutputImageData = selectedImageData;
      outputImage.src = `data:${selectedImageData.mimeType};base64,${selectedImageData.data}`;
      tuneImageEl.src = outputImage.src; // Also update the tune modal image

      historyModalEl.classList.add('hidden');
    });

    historyItemsContainerEl.appendChild(imgEl);
  });
}

const DEFAULT_SUGGESTED_PROMPTS = [
  {displayText: '把它放在桌子上', value: 'Place it on the table'},
  {displayText: '让光线更具戏剧性', value: 'Make the lighting dramatic'},
  {displayText: '在地上添加倒影', value: 'Add a reflection on the floor'},
  {displayText: '将场景变为晴天', value: 'Change the scene to a sunny day'},
  {
    displayText: '把它放在极简主义环境中',
    value: 'Put it in a minimalist setting',
  },
  {
    displayText: '让它看起来像一张复古照片',
    value: 'Make it look like a vintage photo',
  },
];

function renderSuggestedPrompts(
  prompts: {displayText: string; value: string}[],
) {
  suggestedPromptsContainerEl.innerHTML = ''; // Clear existing
  prompts.forEach((prompt) => {
    const button = document.createElement('button');
    button.textContent = prompt.displayText;
    button.className =
      'px-3 py-1 bg-[#353739] border border-gray-600 rounded-full text-xs text-gray-300 hover:bg-[#3d3f42] hover:border-gray-500 transition-colors';
    button.addEventListener('click', () => {
      const currentPrompt = promptEl.value.trim();
      const newPrompt = currentPrompt
        ? `${currentPrompt} ${prompt.value}`
        : prompt.value;
      promptEl.value = newPrompt;
      promptText = newPrompt; // Update state
      promptEl.focus();
    });
    suggestedPromptsContainerEl.appendChild(button);
  });
}

/**
 * A wrapper for the Gemini API call that includes exponential backoff for rate-limiting errors.
 * @param ai The initialized GoogleGenAI instance.
 * @param params The parameters for the generateContent call.
 * @param maxRetries The maximum number of retries.
 * @returns A Promise that resolves with the API response.
 */
async function generateContentWithRetry(
  ai: GoogleGenAI,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any, // Using 'any' as params can be for different model methods
  maxRetries = 3,
) {
  let attempt = 1;
  let delay = 2000; // Start with 2 seconds

  while (attempt <= maxRetries) {
    try {
      // Assuming all relevant API calls are under `generateContent` for this pattern
      const response = await ai.models.generateContent(params);
      // Check for blocked responses which aren't thrown as errors by the SDK
      if (response.promptFeedback?.blockReason) {
        throw new Error(
          `请求被安全设置屏蔽: ${response.promptFeedback.blockReason}.`,
        );
      }
      return response;
    } catch (e) {
      const error = e as Error;
      if (
        error.message.includes('429') ||
        error.message.toLowerCase().includes('resource_exhausted') ||
        error.message.toLowerCase().includes('quota')
      ) {
        if (attempt === maxRetries) {
          throw new Error(
            `API 请求超出配额，经过 ${maxRetries} 次尝试后仍然失败。`,
          );
        }
        showStatusMessage(
          `请求过于频繁，正在等待 ${
            delay / 1000
          } 秒后重试... (尝试次数 ${attempt}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        attempt++;
      } else {
        // Not a rate limit error, rethrow it immediately.
        throw error;
      }
    }
  }
  // This line should not be reachable, but is needed for TypeScript to be happy
  throw new Error('API 调用意外失败。');
}

/**
 * Centralized handler for API errors to provide consistent, user-friendly feedback.
 * @param error The error object caught from an API call.
 */
async function handleApiError(error: unknown) {
  console.error('API Error:', error);
  const errorMessage =
    error instanceof Error ? error.message : 'An unknown error occurred.';

  let userFriendlyMessage = `错误: ${errorMessage}`;
  let shouldOpenDialog = false;

  if (typeof errorMessage === 'string') {
    if (errorMessage.includes('超出配额') || errorMessage.toLowerCase().includes('quota')) {
      userFriendlyMessage = `请求已超出您当前的配额。请检查您的计划和账单详情。 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" class="text-blue-400 underline hover:text-blue-300">了解更多</a>。`;
      shouldOpenDialog = false;
    } else if (errorMessage.includes('Requested entity was not found.')) {
      userFriendlyMessage =
        '找不到模型。这可能是由于无效的 API 密钥或权限问题引起的。请检查您的 API 密钥。';
      shouldOpenDialog = true;
    } else if (
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('API key not valid') ||
      errorMessage.toLowerCase().includes('permission denied')
    ) {
      userFriendlyMessage =
        '您的 API 密钥无效。请输入有效的 API 密钥。';
      shouldOpenDialog = true;
    } else if (errorMessage.includes('安全设置屏蔽')) {
       userFriendlyMessage = `请求被安全设置屏蔽。请尝试调整您的提示词。`;
       shouldOpenDialog = false;
    }
  }

  showStatusError(userFriendlyMessage);

  if (shouldOpenDialog) {
    await openApiKeyDialog();
  }
}

async function analyzeProductAndScene(
  apiKey: string,
  product: File,
  scene: File,
): Promise<{
  mode: MigrationMode;
  preserveHuman: boolean;
  suggestions: {displayText: string; value: string}[];
}> {
  const ai = new GoogleGenAI({apiKey});
  const productPart = await fileToGenerativePart(product);
  const scenePart = await fileToGenerativePart(scene);

  const prompt = `You are a creative director and AI image generation expert. Analyze the provided product and scene images.

Your analysis must produce two results:

1.  **Migration Strategy Recommendation:**
    *   Analyze the product image.
    *   Recommend "product-to-scene" for symmetrical, simple products where the AI can adapt it to the scene.
    *   Recommend "scene-to-product" for asymmetrical, detailed, or branded products to preserve their exact appearance.
    *   Analyze if a human is interacting with the product. Do not count mannequins. The interaction must be the primary focus.

2.  **Creative Prompt Suggestions:**
    *   Generate a list of exactly 3 diverse and creative suggestions for how to integrate the product into the scene.
    *   Each suggestion should have a user-friendly version in Chinese ("displayText") and a corresponding AI instruction in English ("value").

Return a single JSON object with the following structure:
- "recommendedMode": Either "product-to-scene" or "scene-to-product".
- "preserveHuman": A boolean (true or false).
- "suggestions": An array of 3 objects, each with "displayText" and "value" keys.`;

  const response = await generateContentWithRetry(ai, {
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {text: prompt},
        {text: 'Product:'},
        productPart,
        {text: 'Scene:'},
        scenePart,
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedMode: {
            type: Type.STRING,
            enum: ['product-to-scene', 'scene-to-product'],
          },
          preserveHuman: {
            type: Type.BOOLEAN,
          },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                displayText: {type: Type.STRING},
                value: {type: Type.STRING},
              },
              required: ['displayText', 'value'],
            },
          },
        },
        required: ['recommendedMode', 'preserveHuman', 'suggestions'],
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (
      result.recommendedMode &&
      typeof result.preserveHuman === 'boolean' &&
      result.suggestions &&
      Array.isArray(result.suggestions)
    ) {
      return {
        mode: result.recommendedMode,
        preserveHuman: result.preserveHuman,
        suggestions: result.suggestions,
      };
    }
    throw new Error('Incomplete JSON response from model.');
  } catch (e) {
    console.error(
      'Failed to parse JSON for combined analysis:',
      e,
      response.text,
    );
    throw new Error('无法解析产品和场景分析响应。');
  }
}

async function runCombinedAnalysis() {
  if (!productFile || !sceneFile) return;

  // Show loading state for both mode selection and prompts
  suggestedPromptsContainerEl.innerHTML = `<p class="text-xs text-gray-500 italic w-full text-center">正在分析产品并生成建议...</p>`;
  showStatusMessage('正在分析产品以选择最佳模式...');

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // Don't show an error here, just fall back to default
      renderSuggestedPrompts(DEFAULT_SUGGESTED_PROMPTS);
      showStatusMessage(''); // Clear status
      return;
    }
    const analysis = await analyzeProductAndScene(
      apiKey,
      productFile,
      sceneFile,
    );

    // Part 1: Apply migration mode analysis
    setMigrationMode(analysis.mode);
    preserveHumanInProduct = analysis.preserveHuman;

    let modeMessage = '';
    if (analysis.mode === 'product-to-scene') {
      modeMessage = '产品分析为对称性产品。已选择“产品适应场景”模式。';
    } else {
      modeMessage = '检测到独特性产品。已选择“场景匹配产品”模式以保留细节。';
    }

    if (analysis.preserveHuman) {
      const humanMessage = '检测到产品与人物交互，将一同保留。';
      showStatusMessage(`${humanMessage} ${modeMessage}`);
    } else {
      showStatusMessage(modeMessage);
    }

    // Part 2: Apply suggested prompts
    renderSuggestedPrompts(analysis.suggestions);
  } catch (e) {
    handleApiError(e);
    // On failure, render the default ones and clear status
    renderSuggestedPrompts(DEFAULT_SUGGESTED_PROMPTS);
    showStatusMessage('');
  }
}

async function drawOutline(coordinates: OutlinePoint[]) {
  const ctx = productOutlineCanvas.getContext('2d');
  if (!ctx || !productFile) return;

  const image = new Image();
  image.src = URL.createObjectURL(productFile);
  await new Promise((resolve) => (image.onload = resolve));

  // Scale canvas to image's natural dimensions for accurate drawing
  productOutlineCanvas.width = image.naturalWidth;
  productOutlineCanvas.height = image.naturalHeight;

  ctx.clearRect(0, 0, productOutlineCanvas.width, productOutlineCanvas.height);
  ctx.strokeStyle = '#FF00FF'; // Bright magenta
  ctx.lineWidth = 4;
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(coordinates[0].x, coordinates[0].y);
  for (let i = 1; i < coordinates.length; i++) {
    ctx.lineTo(coordinates[i].x, coordinates[i].y);
  }
  ctx.closePath();
  ctx.stroke();
}

function getGenerationConfig() {
  const config: {
    responseModalities: Modality[];
    temperature?: number;
    topP?: number;
    topK?: number;
    seed?: number;
  } = {
    responseModalities: [Modality.IMAGE],
  };

  switch (qualitySetting) {
    case 'fast':
      config.temperature = 0.9;
      config.topP = 1.0;
      config.topK = 1;
      break;
    case 'balanced':
      config.temperature = 0.7;
      config.topP = 0.95;
      config.topK = 32;
      break;
    case 'high-quality':
      config.temperature = 0.2;
      config.topP = 0.95;
      config.topK = 32;
      break;
  }

  if (seedValue !== null) {
    config.seed = seedValue;
  }

  return config;
}

async function isolateProductAndCreateMask(
  apiKey: string,
  product: File,
): Promise<{
  product: {data: string; mimeType: string};
  mask: {data: string; mimeType: string};
}> {
  const ai = new GoogleGenAI({apiKey});
  const productPart = await fileToGenerativePart(product);

  const prompt = `Analyze the provided image. Your task is to return two things in a JSON object:
1. 'productImage': A base64 encoded string of a PNG image of the main product isolated on a transparent background.
2. 'maskImage': A base64 encoded string of a PNG image. This image MUST be a mask of the product, with the product as solid white (#FFFFFF) and the background as solid black (#000000).

Both the product image and the mask image MUST have the exact same dimensions as the input image.`;

  const response = await generateContentWithRetry(ai, {
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{text: prompt}, productPart],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productImage: {
            type: Type.STRING,
            description:
              'A base64 encoded PNG string of the product on a transparent background.',
          },
          maskImage: {
            type: Type.STRING,
            description:
              'A base64 encoded PNG string of the black and white product mask.',
          },
        },
        required: ['productImage', 'maskImage'],
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (result.productImage && result.maskImage) {
      return {
        product: {
          data: result.productImage,
          mimeType: 'image/png',
        },
        mask: {
          data: result.maskImage,
          mimeType: 'image/png',
        },
      };
    }
    throw new Error('Model returned JSON without required image data.');
  } catch (e) {
    console.error(
      'Failed to parse JSON for product isolation:',
      e,
      response.text,
    );
    throw new Error('无法解析产品隔离响应。');
  }
}

async function generateProductOutline(
  apiKey: string,
  product: File,
): Promise<{outline: OutlinePoint[]; mask: {data: string; mimeType: string}}> {
  const ai = new GoogleGenAI({apiKey});
  const productPart = await fileToGenerativePart(product);

  const prompt = `Analyze the provided image. Identify the primary product, ignoring the background.
Your task is to return two things:
1. A polygon outline of the product.
2. A precise black and white mask of the product.

Return a JSON object with two keys:
1. 'outline': An array of objects, where each object has 'x' and 'y' integer coordinates for a polygon enclosing the product. The coordinates MUST be relative to the image's original dimensions.
2. 'mask': A base64 encoded string of a PNG image. This image MUST be a mask of the product, with the product as solid white (#FFFFFF) and the background as solid black (#000000). The mask MUST have the exact same dimensions as the input image.`;

  const response = await generateContentWithRetry(ai, {
    model: 'gemini-2.5-flash',
    contents: {
      parts: [{text: prompt}, productPart],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          outline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                x: {type: Type.INTEGER},
                y: {type: Type.INTEGER},
              },
              required: ['x', 'y'],
            },
          },
          mask: {
            type: Type.STRING,
            description:
              'A base64 encoded PNG string of the black and white product mask.',
          },
        },
        required: ['outline', 'mask'],
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (result.outline && result.outline.length > 0 && result.mask) {
      return {
        outline: result.outline,
        mask: {
          data: result.mask,
          mimeType: 'image/png', // The model is instructed to create a PNG, so this is a safe assumption
        },
      };
    }
    throw new Error('Model returned JSON without outline or mask.');
  } catch (e) {
    console.error('Failed to parse JSON for product outline:', e, response.text);
    throw new Error('无法解析产品轮廓响应。');
  }
}

async function tuneImage(
  apiKey: string,
  base64Image: string,
  mimeType: string,
  prompt: string,
): Promise<{data: string; mimeType: string}> {
  const ai = new GoogleGenAI({apiKey});

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const basePrompt = `Given the input image, apply the following edit: "${prompt}".
Preserve the overall style, quality, and context of the image.
Only apply the requested change. The final output should be a single, edited image.`;

  const generationConfig = getGenerationConfig();

  const response = await generateContentWithRetry(ai, {
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{text: basePrompt}, imagePart],
    },
    config: generationConfig,
  });

  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error(
      'No response candidate found. The prompt may have been blocked.',
    );
  }

  const generatedImagePart = candidate.content?.parts?.find(
    (part) => part.inlineData,
  );

  // Fix: Ensure inlineData.data exists and construct a new object to match the return type.
  if (generatedImagePart?.inlineData?.data) {
    return {
      data: generatedImagePart.inlineData.data,
      mimeType: generatedImagePart.inlineData.mimeType,
    };
  }

  throw new Error('No new image was generated.');
}

async function analyzeGeneratedImage(
  apiKey: string,
  product: File,
  scene: File,
  generatedImageBase64: string,
  mask: {data: string; mimeType: string} | null,
  mode: MigrationMode,
): Promise<{
  productFidelity: {rating: number; justification: string; feedback: string};
  sceneIntegration: {rating: number; justification: string; feedback: string};
  proportionality: {rating: number; justification: string; feedback: string};
  improvementSuggestions: string;
}> {
  const ai = new GoogleGenAI({apiKey});

  const productPart = await fileToGenerativePart(product);
  const scenePart = await fileToGenerativePart(scene);
  const generatedPart = {
    inlineData: {
      data: generatedImageBase64,
      mimeType: 'image/png', // The generation model returns PNG
    },
  };

  let analysisGoal;
  if (mode === 'product-to-scene') {
    analysisGoal = `用户的目标是调整“产品”以适应“场景”。`;
  } else {
    analysisGoal = `用户的目标是调整“场景”以匹配“产品”。因此，“产品保真度”至关重要，应该近乎完美（评分为10），因为产品本身不应发生任何改变。`;
  }

  let prompt;
  const parts = [
    // prompt text will be added here
    {text: '1. 原始产品 (Original Product):'},
    productPart,
    {text: '2. 场景 (Scene):'},
    scenePart,
    {text: '3. 最终生成的图像 (Final Generated Image):'},
    generatedPart,
  ];

  if (mask) {
    prompt = `您是一位一丝不苟、乐于助人的人工智能生成图像质量保证专家。您的所有分析都必须使用“中文”提供。
${analysisGoal}
您的任务是根据三个标准评估最终图像，提供详细的分析和可行的建议。
您将收到四张图片：1. 原始产品。2. 场景。3. 最终生成的图像。4. 产品蒙版。

标准 1: 产品保真度 (最高优先级) - 使用“产品蒙版”（图片4），其中白色区域表示产品在“最终生成的图像”（图片3）中的位置，来隔离产品。将隔离出的产品与“原始产品”（图片1）进行详细比较。检查纹理、颜色、光泽或精细细节是否有任何变化。唯一可接受的变化是为了匹配场景而进行的细微光照调整。

标准 2: 场景融合度 - 产品的比例、位置、光照和阴影在场景中是否真实？如果目标是调整场景，新场景与产品的匹配程度如何？

标准 3: 整体协调性 (比例真实性) - 这是一个关键检查。评估产品尺寸相对于场景中其他物体和整体环境是否真实。您的评估必须取决于用户的目标：
  - 如果目标是“产品适应场景”，则“产品”应被缩放以适应“场景”。它的尺寸在场景的背景下是否合乎逻辑？（例如，一个水龙头不应该比它所连接的水槽还大）。
  - 如果目标是“场景匹配产品”，则“场景”应被缩放以适应“产品”。场景（例如，背景元素、家具）相对于作为固定参考的主角产品，看起来尺寸是否正确？

请以 JSON 对象的形式返回您的分析。所有文本值（justification、feedback、suggestions）都必须使用“中文”提供。
对于每个标准 ("productFidelity", "sceneIntegration", "proportionality")，请提供：
- "rating": 一个从1到10的整数。
- "justification": 对评分的一句话中文总结。
- "feedback": 对评分的详细中文解释，引用具体的视觉元素。请将其格式化为单个字符串，并用换行符 (\\n) 分隔要点。
同时，请包含一个顶级的 "improvementSuggestions" 键，其中包含一个简洁、用户友好的中文字符串，建议如何获得更好的结果。`;

    const maskPart = {
      inlineData: {
        data: mask.data,
        mimeType: mask.mimeType,
      },
    };
    parts.push({text: '4. 产品蒙版 (Product Mask):'});
    parts.push(maskPart);
  } else {
    prompt = `您是一位一丝不苟、乐于助人的人工智能生成图像质量保证专家。您的所有分析都必须使用“中文”提供。
${analysisGoal}
您将收到三张图片：1. 原始产品。2. 场景。3. 最终生成的图像。
您的任务是根据三个标准评估最终图像，提供详细的分析和可行的建议。

标准 1: 产品保真度 - 原始产品的细节（材质、颜色、纹理、形状）保留得如何？

标准 2: 场景融合度 - 产品的比例、位置、光照和阴影在场景中是否真实？如果目标是调整场景，新场景与产品的匹配程度如何？

标准 3: 整体协调性 (比例真实性) - 这是一个关键检查。评估产品尺寸相对于场景中其他物体和整体环境是否真实。您的评估必须取决于用户的目标：
  - 如果目标是“产品适应场景”，则“产品”应被缩放以适应“场景”。它的尺寸在场景的背景下是否合乎逻辑？（例如，一个水龙头不应该比它所连接的水槽还大）。
  - 如果目标是“场景匹配产品”，则“场景”应被缩放以适应“产品”。场景（例如，背景元素、家具）相对于作为固定参考的主角产品，看起来尺寸是否正确？

请以 JSON 对象的形式返回您的分析。所有文本值（justification、feedback、suggestions）都必须使用“中文”提供。
对于每个标准 ("productFidelity", "sceneIntegration", "proportionality")，请提供：
- "rating": 一个从1到10的整数。
- "justification": 对评分的一句话中文总结。
- "feedback": 对评分的详细中文解释，引用具体的视觉元素。请将其格式化为单个字符串，并用换行符 (\\n) 分隔要点。
同时，请包含一个顶级的 "improvementSuggestions" 键，其中包含一个简洁、用户友好的中文字符串，建议如何获得更好的结果。`;
  }

  parts.unshift({text: prompt});

  const response = await generateContentWithRetry(ai, {
    model: 'gemini-2.5-flash',
    contents: {
      parts: parts,
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productFidelity: {
            type: Type.OBJECT,
            properties: {
              rating: {type: Type.INTEGER},
              justification: {type: Type.STRING},
              feedback: {type: Type.STRING},
            },
            required: ['rating', 'justification', 'feedback'],
          },
          sceneIntegration: {
            type: Type.OBJECT,
            properties: {
              rating: {type: Type.INTEGER},
              justification: {type: Type.STRING},
              feedback: {type: Type.STRING},
            },
            required: ['rating', 'justification', 'feedback'],
          },
          proportionality: {
            type: Type.OBJECT,
            properties: {
              rating: {type: Type.INTEGER},
              justification: {type: Type.STRING},
              feedback: {type: Type.STRING},
            },
            required: ['rating', 'justification', 'feedback'],
          },
          improvementSuggestions: {type: Type.STRING},
        },
        required: [
          'productFidelity',
          'sceneIntegration',
          'proportionality',
          'improvementSuggestions',
        ],
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    if (!jsonText || !jsonText.startsWith('{')) {
      throw new Error('Analysis returned an invalid or empty JSON response.');
    }
    const result = JSON.parse(jsonText);
    // Add validation for the parsed result
    if (result.productFidelity && result.sceneIntegration && result.proportionality) {
      return result;
    }
    throw new Error('Parsed JSON is missing required analysis fields.');
  } catch (e) {
    console.error('Failed to parse JSON for image analysis:', e, response.text);
    throw new Error('无法解析图像质量分析响应。');
  }
}

async function migrateWithMask(
  apiKey: string,
  product: File,
  scene: File,
  mask: {data: string; mimeType: string},
  prompt: string,
  mode: MigrationMode,
): Promise<{data: string; mimeType: string; optimizationApplied: boolean}> {
  const ai = new GoogleGenAI({apiKey});

  const productPart = await fileToGenerativePart(product);
  const scenePart = await fileToGenerativePart(scene);
  const maskPart = {
    inlineData: {
      data: mask.data,
      mimeType: mask.mimeType,
    },
  };

  let humanPreservationInstruction = '';
  if (preserveHumanInProduct) {
    if (mode === 'product-to-scene') {
      humanPreservationInstruction = `
**CRITICAL HUMAN PRESERVATION:**
The product image contains a person who is essential to the product's context (e.g., wearing or holding it). You MUST preserve this person along with the product and integrate them into the new scene with the highest level of realism. This includes three critical sub-tasks:
*   **1. Plausible Interaction & Posing (Highest Priority):** Before rendering, you must analyze the physical logic of the interaction. The person's position, posture, and orientation relative to scene objects must be ergonomically correct for the action being performed. For example, to use a mixer in a bucket, the person must be positioned logically *behind* or *beside* the bucket to reach into it. If the initial placement seems physically awkward or impossible, you MUST adjust the person's position to create a believable and logical interaction.
*   **2. Perfect Occlusion:** Pay extreme attention to the spatial relationships between the person/product and objects in the scene. If any part of the person or product is behind a scene object (e.g., a foot behind a bucket), it MUST be correctly occluded (hidden). The final image must have flawless 3D depth and logical layering.
*   **3. Hyper-Realistic Grounding Shadows (MANDATORY FOR REALISM):** The person MUST be firmly grounded to the floor. The "floating" or "pasted-on" look is a critical failure. To prevent this, you MUST render three types of shadows with extreme physical accuracy:
    *   **A. Contact Shadows:** Create very dark, sharp, and precise shadows directly underneath the soles of the shoes where they make physical contact with the floor. This tiny detail is the most important element for indicating weight and contact.
    *   **B. Cast Shadows:** The main shadow cast by the person must perfectly match the direction, length, softness (edge blur), and color tint of the shadows cast by other objects in the scene (like the nearby buckets). Analyze the scene's primary light source and replicate its shadow properties exactly.
    *   **C. Ambient Occlusion:** Generate subtle, soft darkening in the creases where the sides of the shoes meet the floor. This simulates the blocking of bounced, ambient light and adds a final layer of depth and realism, making the person feel truly part of the environment.
`;
    } else {
      // Mode: scene-to-product
      humanPreservationInstruction = `
**NON-NEGOTIABLE CORE DIRECTIVE: The Product and Person's APPEARANCE is IMMUTABLE**
The provided product image, including the person interacting with it, is the absolute ground truth. Their internal appearance (pose, clothes, colors, textures, internal lighting) is PERFECT and MUST NOT BE ALTERED.
*   It is **STRICTLY FORBIDDEN** to change the person's position, pose, scale, or appearance.
*   It is **STRICTLY FORBIDDEN** to horizontally or vertically flip (mirror) the person or product. They MUST maintain their original orientation exactly as provided.
*   It is **STRICTLY FORBIDDEN** to change the product's internal details.
*   Any change to the person or product's appearance constitutes a **FAILED** generation.

**CRITICAL TASK: Generate New, Context-Aware Shadows**
While the person/product is immutable, the shadows they cast onto the new scene you generate MUST be created from scratch to be physically accurate. The original shadows from the product photo must be ignored and replaced.
*   **Hyper-Realistic Grounding Shadows (MANDATORY):** To prevent a "floating" look, you MUST render three types of shadows with extreme physical accuracy onto the new scene floor:
    *   **A. Contact Shadows:** Create very dark, sharp shadows directly where the shoes touch the new ground.
    *   **B. Cast Shadows:** The main shadow cast by the person must perfectly match the direction, softness, and color of the new scene's primary light source.
    *   **C. Ambient Occlusion:** Generate subtle, soft darkening in the creases where the sides of the shoes meet the new floor.

**Main Task: Adapt the SCENE to the Immutable Product**
Your ONLY task is to re-render the background scene *around* the fixed person and product, including these new, realistic shadows. If the original scene's layout creates a logical conflict (e.g., a bucket is too far away for the person to mix in), you MUST resolve this conflict by modifying **THE SCENE ONLY**.
*   **Correct Action:** Move the bucket in the scene to the correct position.
*   **Incorrect Action (FORBIDDEN):** Move the person.
The scene must be sacrificed to maintain the integrity of the product and person.
`;
    }
  }

  let feedbackPromptSection = '';
  if (productFidelityFeedback.length > 0) {
    const feedbackList = productFidelityFeedback
      .map((item) => `- ${item}`)
      .join('\n');
    feedbackPromptSection = `
**FINAL MANDATORY CHECK - USER FEEDBACK:**
Before you generate the final image, you MUST review and apply the following corrections provided directly by the user. Failure to incorporate this feedback will result in an unacceptable output. These rules override any of your other creative interpretations.
**Rules:**
${feedbackList}
`;
  }

  const placementHint = prompt
    ? `**User's placement hint:** ${prompt}`
    : `**User has not provided a placement hint; use your best judgment for a logical and aesthetically pleasing placement.**`;

  let basePrompt;
  if (mode === 'product-to-scene') {
    let scaleInstruction = '';
    if (productMaskScale !== 1.0) {
      scaleInstruction = `*   **User Scale Override:** The user has specified a scale override. You MUST render the product at **${Math.round(
        productMaskScale * 100,
      )}%** of the size that would be automatically determined. This is a mandatory adjustment.`;
    }

    basePrompt = `You are an expert product photographer and photo editor with the mind of a film director. Your goal is to create a single, photorealistic image by integrating a product into a scene, making it look as if it were naturally part of a single, believable moment in time.

**OVERARCHING GOAL: Narrative Coherence and Scene Logic**
Beyond physical realism, the final image MUST tell a clear and logical story. Your task is to ensure all elements in the scene support the primary action of the product.
*   **Eliminate Contradictions:** You MUST actively analyze the original scene for elements that contradict or distract from the product's action. If such elements exist, you MUST modify or remove them to improve the story.
*   **Concrete Example (based on user feedback):** If the product is a mixer being used in a bucket of mortar, and the original scene contains a second, full, untouched bucket of mortar right next to it, this is logically inconsistent. A worker would not be mixing a new batch while a perfect one sits unused. In this situation, you MUST alter the scene to resolve this contradiction. For example, you could render the second bucket as empty, or remove it from the scene entirely to focus the narrative on the action of mixing.

**Core Task:**
Integrate the product (defined by the **white area** of the **mask image**) into the scene.

**Key Instructions:**

1.  **Preserve Core Product Identity:**
    *   You MUST maintain the product's fundamental brand, model, material, and color scheme from the original product image. A Nike shoe must remain a Nike shoe with the correct logo and materials.
    *   This is about brand and model integrity, not about keeping it in a static, unused state.

${humanPreservationInstruction}

2.  **Contextual State Adjustment & Dynamic Interaction Physics Simulation (CRITICAL for Realism):**
    *   To make the product look like it truly *belongs* and is *functional*, you are **encouraged to modify its state** based on the scene's context and common real-world usage.
    *   **Render Dynamic Interaction Effects:** You MUST render the physical *consequences* of its use with extreme realism. This is not just adding an effect; it's simulating an action.
        *   **Analyze the Action:** What is the product doing? A mixer churns cement, a drill cuts wood.
        *   **Simulate the Effect with Physics:** Render the resulting dynamic effects believably. For a mixer, this means showing **mortar being actively thrown and splashing** from the churning motion. Particles should have motion blur, follow realistic trajectories, and accumulate on nearby surfaces. A static, generic 'dust cloud' is unacceptable.
        *   **Interact with the Scene:** These effects MUST interact with the scene's lighting and surfaces. Splashes should create wet spots, dust clouds should be illuminated by light sources.
    *   **Hyper-realistic Fluid Dynamics:** When showing liquids like water, render them with extreme photorealism, including accurate transparency, refraction, caustics, and physically plausible splashes and ripples.

3.  **Environmental Integration:**
    *   **Perspective and Scale (CRITICAL):**
        *   **Analyze Perspective:** Identify the scene's perspective lines and vanishing points. The product MUST be transformed to perfectly match this perspective.
        *   **Determine Realistic Scale:** Critically evaluate other objects in the scene to determine a proportional and realistic size for the product.
        ${scaleInstruction}
    *   **Lighting and Shadows:** The product must be lit perfectly according to the scene's light sources. Generate physically accurate shadows.
    *   **Reflections and Color Cast:** If the product is reflective, add subtle reflections. Apply a slight color cast from the ambient light.

4.  **Handle Interactions (If Mask is Edited):**
    *   The **black areas** of the mask over the product indicate "interaction zones." In these zones, you can create occlusions (e.g., a hand gripping the product).

${placementHint}

${feedbackPromptSection}

Your output must be a single, cohesive, and logically sound image.`;
  } else {
    // Mode: scene-to-product
    basePrompt = `You are an expert art director creating a showcase image for a product, with the mind of a film director. Your goal is to create a new, photorealistic scene that is perfectly tailored to the provided product, telling a clear and logical story.

**OVERARCHING GOAL: Narrative Coherence and Scene Logic**
When you generate a new scene around the product, it must be purposeful and tell a clear story.
*   **Avoid Redundancy:** Do not generate background elements that are redundant or logically inconsistent with the product's state or action. Every element in the new scene should contribute to the narrative.
*   **Concrete Example (based on user feedback):** If the product is a person using a mixer in a bucket, do not generate a second, full, untouched bucket of mortar next to them. This creates a confusing narrative. Instead, create a scene that logically supports the single action, for example, with tools, empty bags of cement, or an area that is about to be tiled.

**Key Instructions:**

${humanPreservationInstruction}

1.  **Adapt the SCENE to the PRODUCT:**
    *   Use the original "scene" image only as *inspiration* for the type of environment to create.
    *   **Match Lighting:** The lighting of the new scene you create MUST be dictated by the lighting already present on the product.
    *   **Harmonize Aesthetics:** The new scene's style, color palette, and mood must be modified to complement the product.
    *   **Create a Showcase:** The final composition should make the product the hero. The scene serves to elevate the product.

${placementHint}

${feedbackPromptSection}

Your final output must be a single, cohesive, and logically sound image.`;
  }

  const generationConfig = getGenerationConfig();

  const response = await generateContentWithRetry(ai, {
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {text: basePrompt},
        {text: 'Product:'},
        productPart,
        {text: 'Scene:'},
        scenePart,
        {text: 'Mask:'},
        maskPart,
      ],
    },
    config: generationConfig,
  });

  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error(
      'No response candidate found. The prompt may have been blocked.',
    );
  }
  const imagePart = candidate.content?.parts?.find((part) => part.inlineData);

  if (imagePart?.inlineData) {
    const {data, mimeType} = imagePart.inlineData;
    return {data, mimeType, optimizationApplied: false}; // Optimization doesn't apply to this method
  }

  throw new Error('No image was generated using the mask method.');
}

async function migrateImage(
  apiKey: string,
  product: File,
  scene: File,
  prompt: string,
  outline: OutlinePoint[] | null,
  mode: MigrationMode,
): Promise<{data: string; mimeType: string; optimizationApplied: boolean}> {
  const ai = new GoogleGenAI({apiKey});

  const productPart = await fileToGenerativePart(product);
  const scenePart = await fileToGenerativePart(scene);

  const optimizationApplied = Math.random() < 0.5;

  let humanPreservationInstruction = '';
  if (preserveHumanInProduct) {
    if (mode === 'product-to-scene') {
      humanPreservationInstruction = `
**CRITICAL HUMAN PRESERVATION:**
The product image contains a person who is essential to the product's context (e.g., wearing or holding it). You MUST preserve this person along with the product and integrate them into the new scene with the highest level of realism. This includes three critical sub-tasks:
*   **1. Plausible Interaction & Posing (Highest Priority):** Before rendering, you must analyze the physical logic of the interaction. The person's position, posture, and orientation relative to scene objects must be ergonomically correct for the action being performed. For example, to use a mixer in a bucket, the person must be positioned logically *behind* or *beside* the bucket to reach into it. If the initial placement seems physically awkward or impossible, you MUST adjust the person's position to create a believable and logical interaction.
*   **2. Perfect Occlusion:** Pay extreme attention to the spatial relationships between the person/product and objects in the scene. If any part of the person or product is behind a scene object (e.g., a foot behind a bucket), it MUST be correctly occluded (hidden). The final image must have flawless 3D depth and logical layering.
*   **3. Hyper-Realistic Grounding Shadows (MANDATORY FOR REALISM):** The person MUST be firmly grounded to the floor. The "floating" or "pasted-on" look is a critical failure. To prevent this, you MUST render three types of shadows with extreme physical accuracy:
    *   **A. Contact Shadows:** Create very dark, sharp, and precise shadows directly underneath the soles of the shoes where they make physical contact with the floor. This tiny detail is the most important element for indicating weight and contact.
    *   **B. Cast Shadows:** The main shadow cast by the person must perfectly match the direction, length, softness (edge blur), and color tint of the shadows cast by other objects in the scene (like the nearby buckets). Analyze the scene's primary light source and replicate its shadow properties exactly.
    *   **C. Ambient Occlusion:** Generate subtle, soft darkening in the creases where the sides of the shoes meet the floor. This simulates the blocking of bounced, ambient light and adds a final layer of depth and realism, making the person feel truly part of the environment.
`;
    } else {
      // Mode: scene-to-product
      humanPreservationInstruction = `
**NON-NEGOTIABLE CORE DIRECTIVE: The Product and Person's APPEARANCE is IMMUTABLE**
The provided product image, including the person interacting with it, is the absolute ground truth. Their internal appearance (pose, clothes, colors, textures, internal lighting) is PERFECT and MUST NOT BE ALTERED.
*   It is **STRICTLY FORBIDDEN** to change the person's position, pose, scale, or appearance.
*   It is **STRICTLY FORBIDDEN** to horizontally or vertically flip (mirror) the person or product. They MUST maintain their original orientation exactly as provided.
*   It is **STRICTLY FORBIDDEN** to change the product's internal details.
*   Any change to the person or product's appearance constitutes a **FAILED** generation.

**CRITICAL TASK: Generate New, Context-Aware Shadows**
While the person/product is immutable, the shadows they cast onto the new scene you generate MUST be created from scratch to be physically accurate. The original shadows from the product photo must be ignored and replaced.
*   **Hyper-Realistic Grounding Shadows (MANDATORY):** To prevent a "floating" look, you MUST render three types of shadows with extreme physical accuracy onto the new scene floor:
    *   **A. Contact Shadows:** Create very dark, sharp shadows directly where the shoes touch the new ground.
    *   **B. Cast Shadows:** The main shadow cast by the person must perfectly match the direction, softness, and color of the new scene's primary light source.
    *   **C. Ambient Occlusion:** Generate subtle, soft darkening in the creases where the sides of the shoes meet the new floor.

**Main Task: Adapt the SCENE to the Immutable Product**
Your ONLY task is to re-render the background scene *around* the fixed person and product, including these new, realistic shadows. If the original scene's layout creates a logical conflict (e.g., a bucket is too far away for the person to mix in), you MUST resolve this conflict by modifying **THE SCENE ONLY**.
*   **Correct Action:** Move the bucket in the scene to the correct position.
*   **Incorrect Action (FORBIDDEN):** Move the person.
The scene must be sacrificed to maintain the integrity of the product and person.
`;
    }
  }

  let feedbackPromptSection = '';
  if (productFidelityFeedback.length > 0) {
    const feedbackList = productFidelityFeedback
      .map((item) => `- ${item}`)
      .join('\n');
    feedbackPromptSection = `
**FINAL MANDATORY CHECK - USER FEEDBACK:**
Before you generate the final image, you MUST review and apply the following corrections provided directly by the user. Failure to incorporate this feedback will result in an unacceptable output. These rules override any of your other creative interpretations.
**Rules:**
${feedbackList}
`;
  }

  let basePrompt;

  if (mode === 'product-to-scene') {
    let optimizationPrompt = '';
    let outlinePrompt = '';

    if (optimizationApplied) {
      optimizationPrompt = `
**Creative Enhancement (50% Chance Triggered):**
Based on the product's function, creatively enhance the scene to show it in a natural, real-world use case. This must be a subtle, photorealistic addition that makes the product feel more alive and integrated. This involves not just changing the product's state, but rendering the physical CONSEQUENCES of its use.
- **Simulate the Action:** Analyze what the product does and render the resulting dynamic effects with extreme realism.
- **Example: Mixer.** If the product is a mixer, show it actively churning material, causing **hyper-realistic splashes and particle ejections**. The splashes must look like they are in motion, following physical trajectories, and interacting with the scene's light and surfaces. Avoid static, fake-looking dust clouds.
- **Example: Lamp.** If the product is a lamp, it must emit light that casts soft, physically-correct shadows and highlights on its surroundings. The quality of the light (hard/soft, warm/cool) must be believable.
- **Example: Faucet.** If the product is a faucet, show **hyper-realistic water flowing from it**. The water splash, transparency, and motion must be indistinguishable from a real photograph.
**IMPORTANT**: This creative enhancement must NOT alter the original product itself in any way. The product's details, material, and color must be perfectly preserved.
`;
    }

    if (outline) {
      outlinePrompt = `
**Product Shape Guarantee:**
You have been provided with a precise polygon outline of the product.
You MUST ensure the final migrated product's silhouette fits *exactly* within this outline. Do NOT deviate from this shape. This is a strict constraint.
The outline coordinates are: ${JSON.stringify(outline)}
`;
    }

    basePrompt = `You are an expert product photographer and photo editor with the mind of a film director. Your goal is to create a single, photorealistic image by flawlessly integrating a product into a scene, ensuring the final result tells a clear and logical story.

**OVERARCHING GOAL: Narrative Coherence and Scene Logic**
Beyond physical realism, the final image MUST tell a clear and logical story. Your task is to ensure all elements in the scene support the primary action of the product.
*   **Eliminate Contradictions:** You MUST actively analyze the original scene for elements that contradict or distract from the product's action. If such elements exist, you MUST modify or remove them to improve the story.
*   **Concrete Example (based on user feedback):** If the product is a mixer being used in a bucket of mortar, and the original scene contains a second, full, untouched bucket of mortar right next to it, this is logically inconsistent. A worker would not be mixing a new batch while a perfect one sits unused. In this situation, you MUST alter the scene to resolve this contradiction. For example, you could render the second bucket as empty, or remove it from the scene entirely to focus the narrative on the action of mixing.


**CRITICAL INSTRUCTIONS:**

1.  **Product Preservation (Highest Priority):**
    *   You MUST preserve every detail of the original product.
    *   The material, color, and texture MUST remain identical.
    *   Do NOT alter, add, or remove any features of the product itself.

${humanPreservationInstruction}

${outlinePrompt}

2.  **Scene Integration (Realism is Key):**
    *   **Analyze the Scene:** Deeply understand the scene's lighting, shadows, perspective, and overall ambiance.
    *   **Smart Placement:** Logically place the product where it would naturally belong.
    *   **Realistic Perspective and Scale (CRITICAL):** The product MUST be transformed (scaled, rotated, and skewed) to perfectly match the scene's perspective and have a proportional size relative to other objects.
    *   **Advanced Lighting and Shadow Simulation:** This is crucial. Shadows MUST match the light source's direction and quality (hard/soft). Generate subtle contact shadows where the product touches a surface.

${optimizationPrompt}

${feedbackPromptSection}

Your final output should be a single, cohesive, and logically sound image.`;
  } else {
    // Mode: scene-to-product
    basePrompt = `You are an expert art director creating a showcase image for a product, with the mind of a film director. Your goal is to create a new, photorealistic scene that is perfectly tailored to showcase the provided product, telling a clear and logical story.

**OVERARCHING GOAL: Narrative Coherence and Scene Logic**
When you generate a new scene around the product, it must be purposeful and tell a clear story.
*   **Avoid Redundancy:** Do not generate background elements that are redundant or logically inconsistent with the product's state or action. Every element in the new scene should contribute to the narrative.
*   **Concrete Example (based on user feedback):** If the product is a person using a mixer in a bucket, do not generate a second, full, untouched bucket of mortar next to them. This creates a confusing narrative. Instead, create a scene that logically supports the single action, for example, with tools, empty bags of cement, or an area that is about to be tiled.

**CRITICAL INSTRUCTIONS:**

${humanPreservationInstruction}

1.  **Adapt the SCENE to the PRODUCT:**
    *   Use the original "scene" image only as *inspiration* for the *type* of environment.
    *   **Re-render the entire scene AROUND the product.**
    *   **Match Lighting:** The lighting of the new scene you create MUST be dictated by the lighting already present on the product.
    *   **Harmonize Aesthetics:** The new scene's style, color palette, and mood must be modified to complement the product.
    *   **Create a Showcase:** The final composition should make the product the hero.

${feedbackPromptSection}

Your final output should be a single, cohesive, and logically sound image.`;
  }

  const generationConfig = getGenerationConfig();

  const parts = [{text: basePrompt}, productPart, scenePart];
  if (prompt) {
    parts.push({text: `User's placement hint: ${prompt}`});
  }

  const response = await generateContentWithRetry(ai, {
    model: 'gemini-2.5-flash-image',
    contents: {
      parts,
    },
    config: generationConfig,
  });

  const candidate = response.candidates?.[0];

  if (!candidate) {
    if (response.promptFeedback?.blockReason) {
      throw new Error(
        `Request was blocked due to ${response.promptFeedback.blockReason}.`,
      );
    }
    throw new Error(
      'No response candidate found. The prompt may have been blocked.',
    );
  }

  const imagePart = candidate.content?.parts?.find((part) => part.inlineData);

  if (imagePart?.inlineData) {
    const {data, mimeType} = imagePart.inlineData;
    return {data, mimeType, optimizationApplied};
  }

  throw new Error(
    'No images were generated. The response did not contain image data.',
  );
}

async function migrate() {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    showStatusError('API 密钥未配置。请输入您的 API 密钥。');
    await openApiKeyDialog();
    return;
  }

  if (!productFile || !sceneFile) {
    showStatusError('请提供产品图和场景图。');
    return;
  }

  showStatusMessage('开始迁移过程...');
  outputImage.classList.add('hidden');
  outputPlaceholderEl.classList.remove('hidden');
  outputActionsEl.classList.add('hidden');
  feedbackContainerEl.classList.add('hidden');
  loaderEl.classList.remove('hidden');
  setControlsDisabled(true);
  currentOutputImageData = null;

  const MAX_RETRIES = 3;
  const FIDELITY_THRESHOLD = 8; // The minimum acceptable rating for fidelity
  const PROPORTIONALITY_THRESHOLD = 8; // The minimum acceptable rating for scale
  const maskForMigration = editedProductMaskData || productMaskData;

  try {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      let statusText = `正在生成图像（尝试次数 ${attempt}/${MAX_RETRIES}）... 这可能需要一些时间。`;
      if (maskForMigration) {
        statusText = `正在使用产品蒙版进行集成以获得最高保真度（尝试次数 ${attempt}/${MAX_RETRIES}）...`;
      }
      showStatusMessage(statusText);

      // CHOOSE MIGRATION STRATEGY
      const generatedImageData = maskForMigration
        ? await migrateWithMask(
            apiKey,
            productFile,
            sceneFile,
            maskForMigration,
            promptText,
            migrationMode,
          )
        : await migrateImage(
            apiKey,
            productFile,
            sceneFile,
            promptText,
            productOutlineCoordinates,
            migrationMode,
          );

      currentOutputImageData = {
        data: generatedImageData.data,
        mimeType: generatedImageData.mimeType,
      };

      // Temporarily show the generated image while we analyze it
      const tempImageUrl = `data:${generatedImageData.mimeType};base64,${generatedImageData.data}`;
      outputImage.src = tempImageUrl;
      outputImage.classList.remove('hidden');
      outputPlaceholderEl.classList.add('hidden');
      feedbackContainerEl.classList.remove('hidden');

      let statusMessage = `正在分析图像质量（尝试次数 ${attempt}/${MAX_RETRIES}）...`;
      if (
        generatedImageData.optimizationApplied &&
        migrationMode === 'product-to-scene'
      ) {
        statusMessage = `已应用创意增强。正在分析图像（尝试次数 ${attempt}/${MAX_RETRIES}）...`;
      }
      showStatusMessage(statusMessage);

      const analysisResult = await analyzeGeneratedImage(
        apiKey,
        productFile,
        sceneFile,
        generatedImageData.data,
        maskForMigration,
        migrationMode,
      );

      const fidelity = analysisResult.productFidelity;
      const integration = analysisResult.sceneIntegration;
      const proportionality = analysisResult.proportionality;
      const suggestions = analysisResult.improvementSuggestions;

      const renderStars = (rating: number) =>
        '★'.repeat(rating) + '☆'.repeat(10 - rating);

      const formatFeedback = (feedback: string) => {
        if (!feedback) return '<li>未提供具体反馈。</li>';
        return feedback
          .split('\n')
          .map(
            (line) =>
              `<li class="text-xs text-gray-400">${line.replace(
                /^- /,
                '',
              )}</li>`,
          )
          .join('');
      };

      const buildAnalysisHtml = (
        title: string,
        titleColor: string,
        borderColor: string,
        bgColor: string,
      ) => `
        <div class="text-left text-sm ${bgColor} border ${borderColor} rounded-lg">
          <div id="analysis-header" class="flex justify-between items-center cursor-pointer p-3" aria-expanded="true" aria-controls="analysis-details">
            <div class="font-bold ${titleColor}">${title}</div>
            <button class="p-1 rounded-full hover:bg-white/10 transition-colors" aria-label="切换分析详情" tabindex="-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div id="analysis-details" class="space-y-3 p-3 pt-0">
            <!-- Product Fidelity -->
            <div>
              <p class="text-gray-300 font-semibold">产品保真度: <span class="font-mono text-yellow-400">${renderStars(
                fidelity.rating,
              )}</span> <span class="text-gray-400 text-xs">(${
                fidelity.rating
              }/10)</span></p>
              <p class="text-xs text-gray-400 italic mt-1">${
                fidelity.justification
              }</p>
              <ul class="list-disc list-inside mt-1 pl-2 space-y-0.5">${formatFeedback(
                fidelity.feedback,
              )}</ul>
            </div>

            <!-- Scene Integration -->
            <div>
              <p class="text-gray-300 font-semibold">场景融合度: <span class="font-mono text-yellow-400">${renderStars(
                integration.rating,
              )}</span> <span class="text-gray-400 text-xs">(${
                integration.rating
              }/10)</span></p>
              <p class="text-xs text-gray-400 italic mt-1">${
                integration.justification
              }</p>
              <ul class="list-disc list-inside mt-1 pl-2 space-y-0.5">${formatFeedback(
                integration.feedback,
              )}</ul>
            </div>

            <!-- Proportionality -->
            <div>
              <p class="text-gray-300 font-semibold">整体协调性: <span class="font-mono text-yellow-400">${renderStars(
                proportionality.rating,
              )}</span> <span class="text-gray-400 text-xs">(${
                proportionality.rating
              }/10)</span></p>
              <p class="text-xs text-gray-400 italic mt-1">${
                proportionality.justification
              }</p>
              <ul class="list-disc list-inside mt-1 pl-2 space-y-0.5">${formatFeedback(
                proportionality.feedback,
              )}</ul>
            </div>
            
            <!-- Suggestions -->
            ${
              suggestions
                ? `
              <div class="pt-2 border-t border-gray-600/50">
                <p class="font-semibold text-gray-300">💡 改进建议</p>
                <p class="text-xs text-gray-400 mt-1">${suggestions}</p>
              </div>`
                : ''
            }
          </div>
        </div>
      `;

      const attachCollapsibleListener = () => {
        const header = document.querySelector('#analysis-header');
        const details = document.querySelector('#analysis-details');
        const icon = header?.querySelector('svg');

        if (header && details && icon) {
          header.addEventListener('click', () => {
            const isExpanded = !details.classList.contains('hidden');
            details.classList.toggle('hidden');
            header.setAttribute('aria-expanded', String(!isExpanded));
            icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(-180deg)';
          });
        }
      };

      if (
        fidelity.rating >= FIDELITY_THRESHOLD &&
        proportionality.rating >= PROPORTIONALITY_THRESHOLD
      ) {
        generationHistory.unshift(currentOutputImageData); // Add to history on success
        updateHistoryButtonState();

        const successHtml = buildAnalysisHtml(
          `质量分析通过（尝试次数 ${attempt}）`,
          'text-white',
          'border-green-600',
          'bg-green-900/50',
        );
        showStatusMessage(successHtml);
        attachCollapsibleListener();
        outputActionsEl.classList.remove('hidden');
        return; // Success, exit the function
      }

      // Fidelity or Proportionality was too low, handle retry or failure
      if (attempt < MAX_RETRIES) {
        const reasons = [];
        if (fidelity.rating < FIDELITY_THRESHOLD) {
          reasons.push(`产品保真度为 ${fidelity.rating}/10`);
        }
        if (proportionality.rating < PROPORTIONALITY_THRESHOLD) {
          reasons.push(`整体协调性为 ${proportionality.rating}/10`);
        }
        const reasonText = reasons.join('，');

        const retryMessage = `
          <div class="text-left text-sm p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg space-y-1">
            <p class="font-bold text-white">质量检查失败（尝试次数 ${attempt}）。</p>
            <p class="text-gray-300">${reasonText}（阈值为 ${FIDELITY_THRESHOLD}）。正在重试...</p>
          </div>
        `;
        showStatusMessage(retryMessage);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief pause
      } else {
        const failureHtml = buildAnalysisHtml(
          `经过 ${MAX_RETRIES} 次尝试后仍未达到质量标准。`,
          'text-white',
          'border-red-600',
          'bg-red-900/50',
        );
        showStatusMessage(failureHtml);
        attachCollapsibleListener();
        outputActionsEl.classList.remove('hidden');
      }
    }
  } catch (e) {
    handleApiError(e);
  } finally {
    loaderEl.classList.add('hidden');
    setControlsDisabled(false);
    // Re-enable button only if files are still selected
    validateInputs();
  }
}

// --- Initial App Setup ---
renderSuggestedPrompts(DEFAULT_SUGGESTED_PROMPTS);
validateInputs();
loadSettingsFromLocalStorage();
updateHistoryButtonState();
renderSavedFeedback();
