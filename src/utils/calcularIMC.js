const calcularIMC = (peso,talla) => {
    if (!peso || !talla) return null;
    const pesoKg = parseFloat(peso);
    const tallaM = parseFloat(talla) / 100;
    return tallaM > 0 ? (pesoKg / (tallaM ** 2)).toFixed(2) : null;
  };

  export default calcularIMC