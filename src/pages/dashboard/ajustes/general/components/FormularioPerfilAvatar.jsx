import Button3 from '@/components/atomos/Button3';
import { loader } from '@/utils/loader/showLoader';
import { showToast } from '@/utils/toast/toastShow';
import { User2 } from 'lucide-react';
import { useState } from 'react';

export default function FormularioPerfilAvatar({ user }) {
  // console.log(user)
  const [previewUrl, setPreviewUrl] = useState(user?.srcPhoto);
  const [file, setFile] = useState(null);

  const handleImageFrente = event => {
    const file = event.target.files[0];
    setPreviewUrl(URL.createObjectURL(file));
    setFile(file);
  };

  const handleSubirImage = async () => {
    loader(true);
    if (!file) {
      showToast('No se seleccionó imagen ', {
        background: 'bg-red-600',
      });
      loader(false);
      console.error('No se seleccionó ninguna imagen');
      return;
    }

    try {
      let srcPhoto = previewUrl;

      if (file) {
        const fileExtensionFrente = file.name.split('.').pop();
        const fileRef = ref(storage, `usuario/${user.id}/srcPhoto.${fileExtensionFrente}`);
        const uploadTask = await uploadBytes(fileRef, file);
        srcPhoto = await getDownloadURL(uploadTask.ref);
      }

      const fetching = await fetch(`/api/usuario/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          srcPhoto: srcPhoto,
        }),
      });

      const response = await fetching.json();
      if (fetching.ok) {
        loader(false);
        showToast('Cambios guardados', {
          background: 'bg-green-600',
        });
      }
      console.log(response);
    } catch (error) {
      loader(false);
      console.error('Error al subir la imagen', error);
    }
  };
  return (
    <div className="md:w-full flex items-center gap-3 mr-4 pr-4 border-r">
      <div className="md:w-52 md:h-52 w-28 h-28 flex fle m-auto items-center justify-center overflow-hidden rounded-lg shadow ">
        {previewUrl ? (
          <div className="relative w-full h-full group">
            <label
              htmlFor="srcPhoto"
              className="border-dashed border absolute top-0 left-0 rounded-lg hidden group-hover:flex  border-primary-100 w-full h-full items-center justify-center uppercase font-semibold  m-auto cursor-pointer hover:bg-primary-100/40 duration-300 bg-transparent hover:text-white text-xs"
            >
              cambiar foto
              <input
                type="file"
                name="srcPhoto"
                onChange={handleImageFrente}
                id="srcPhoto"
                className="hidden"
              />
            </label>
            <img
              src={previewUrl}
              alt="frente"
              width={'200px'}
              height={'150px'}
              className="object-contain w-full h-full"
            />
          </div>
        ) : (
          <label
            htmlFor="srcPhoto"
            className="group rounded-lg  w-full h-full relative items-center justify-center flex uppercase font-semibold  m-auto cursor-pointer hover:bg-primary-100/40 duration-300 hover:text-white text-xs"
          >
            <User2 className=" text-primary-texto w-full h-full " />
            <span className="absolute z-10 bottom-5  rounded bg-primary-texto text-white px-3 py-1.5">
              Foto Perfil
            </span>
            <input
              type="file"
              name="srcPhoto"
              onChange={handleImageFrente}
              id="srcPhoto"
              className="hidden"
            />
          </label>
        )}
      </div>

      <Button3 onClick={handleSubirImage}>Cargar</Button3>
    </div>
  );
}
