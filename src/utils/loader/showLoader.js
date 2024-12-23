export function loader(isLoading) {
    // Busca el loader en el documento
    let loading = document.querySelector('.loaderr');
  
    // Si isLoading es verdadero y el loader no existe, crea uno nuevo
    if (isLoading && !loading) {
      loading = document.createElement('div');
      loading.classList.add('loaderr');
      const body = document.querySelector('body');
      body.appendChild(loading);
    }
  
    // Si isLoading es verdadero, cambia el display a flex
    if (isLoading && loading) {
      loading.style.display = 'flex';
    }
  
    // Si isLoading es falso y el loader existe, cambia el display a none
    if (!isLoading && loading) {
      loading.style.display = 'none';
    }
}