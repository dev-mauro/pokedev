const showSearchToast = (string, type, count) => {
  const toastInfo = getToast(string, type, count);

  showToast(toastInfo);

  return toastInfo;
};

const showToast = (toastConfig) => {
  const currentToast = document.querySelector(".toastify");

  if (currentToast) currentToast.remove();

  Toastify(toastConfig).showToast();
};

//Retorna un objeto de configuración toast según parametros
//String=nombre pokemon, type=tipo de notificacion, count=numero de pokes
const getToast = (string, type, count) => {
  if (type == "green") {
    count > 1
      ? (string = `${count} ${string} pokemon found`)
      : (string = `${string} found`);
  } else {
    string = `${string} not found`;
  }

  const toast = {
    text: string,
    duration: 3000,
    position: "center",
    gravity: "top",
    className: type,
  };

  return toast;
};

export { getToast, showToast, showSearchToast };
