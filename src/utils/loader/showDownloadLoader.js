export const downloadLoader = (show) => {
  const loader = document.querySelector('.download-loader-container');
  if (!loader) return;
  
  if (show) {
    loader.style.display = 'block';
    // Auto ocultar después de 3 segundos
    setTimeout(() => {
      loader.style.display = 'none';
    }, 3000);
  } else {
    loader.style.display = 'none';
  }
}; 