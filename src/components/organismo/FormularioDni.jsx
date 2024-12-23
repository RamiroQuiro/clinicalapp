import React, { useState } from 'react';
import Button3 from '../atomos/Button3';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { storage } from '@/firebase/client';
import { showToast } from '../Toast/toastShow';
import { loader } from '../loader/showLoader';

export default function FormularioDni({ cliente }) {
    const [previewUrlFrente, setPreviewUrlFrente] = useState(cliente.srcDniFrente || null);
    const [previewUrlReverso, setPreviewUrlReverso] = useState(cliente.srcDniReverso || null);
    const [fileFrente, setFileFrente] = useState(null);
    const [fileReverso, setFileReverso] = useState(null);

    const handleImageFrente = (event) => {
        const file = event.target.files[0];
        setPreviewUrlFrente(URL.createObjectURL(file));
        setFileFrente(file);
    }

    const handleImageReverso = (event) => {
        const file = event.target.files[0];
        setPreviewUrlReverso(URL.createObjectURL(file));
        setFileReverso(file);
    }

    const handleSubirDni = async () => {
        loader(true)
        if (!fileFrente && !fileReverso) {
            showToast('No se seleccionó imagen para el frente o reverso', {
                background: 'bg-red-600'
            });
            loader(false)
            console.error('No se seleccionó ninguna imagen para el frente o reverso');
            return;
        }

        try {
            let urlFrente = previewUrlFrente;
            let urlReverso = previewUrlReverso;

            if (fileFrente) {
                const fileExtensionFrente = fileFrente.name.split('.').pop();
                const fileRef = ref(storage, `usuario/${cliente.usuarioId}/clientes/${cliente.id}/dniFrente.${fileExtensionFrente}`);
                const uploadTask = await uploadBytes(fileRef, fileFrente);
                urlFrente = await getDownloadURL(uploadTask.ref);
            }

            if (fileReverso) {
                const fileExtensionReverso = fileReverso.name.split('.').pop();
                const fileRefReverso = ref(storage, `usuario/${cliente.usuarioId}/clientes/${cliente.id}/dniReverso.${fileExtensionReverso}`);
                const uploadTaskReverso = await uploadBytes(fileRefReverso, fileReverso);
                urlReverso = await getDownloadURL(uploadTaskReverso.ref);
            }

            const fetching = await fetch(`/api/clientes/${cliente.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    srcDniFrente: urlFrente,
                    srcDniReverso: urlReverso
                })
            });

            const response = await fetching.json();
            if (fetching.ok) {
                loader(false)
                showToast('Cambios guardados',{
                    background:'bg-green-600'
                });
            }
            console.log(response);
        } catch (error) {
            loader(false)
            console.error('Error al subir la imagen', error);
        }
    }
    return (
        <div className="md:w-1/3 w-full flex items-center border-r flex-col gap-3">
            <div className='w-52 h-28 flex m-auto items-center justify-center overflow-hidden rounded-lg shadow '>
                {previewUrlFrente ?
                    <div className='relative w-full h-full group'>
                        <label htmlFor="dniFrente" className='border-dashed border absolute top-0 left-0 rounded-lg hidden group-hover:flex  border-primary-100 w-full h-full items-center justify-center uppercase font-semibold  m-auto cursor-pointer hover:bg-primary-100/40 duration-300 bg-transparent hover:text-white text-xs'>
                            cambiar foto
                            <input type="file" name='dniFrente' onChange={handleImageFrente} id='dniFrente' className='hidden' />
                        </label>
                        <img src={previewUrlFrente} alt="frente" width={'200px'} height={'150px'} className='object-cover w-full h-full' />
                    </div>
                    :
                    <label htmlFor="dniFrente" className='border-dashed border rounded-lg  border-primary-100 w-full h-full items-center justify-center flex uppercase font-semibold  m-auto cursor-pointer hover:bg-primary-100/40 duration-300 hover:text-white text-xs'>
                        Dni Frente
                        <input type="file" name='dniFrente' onChange={handleImageFrente} id='dniFrente' className='hidden' />
                    </label>}
            </div>

            <div className='w-52 h-28 flex m-auto items-center justify-center overflow-hidden rounded-lg shadow '>
                {previewUrlReverso ?
                    <div className='relative w-full h-full group'>
                        <label htmlFor="dniReverso" className='border-dashed border absolute top-0 left-0 rounded-lg hidden group-hover:flex  border-primary-100 w-full h-full items-center justify-center uppercase font-semibold  m-auto cursor-pointer hover:bg-primary-100/40 duration-300 bg-transparent hover:text-white text-xs'>
                            cambiar foto
                            <input type="file" name='dniReverso' onChange={handleImageReverso} id='dniReverso' className='hidden' />
                        </label>
                        <img src={previewUrlReverso} alt="reverso" width={'200px'} height={'150px'} className='object-cover w-full h-full'  />
                    </div>
                    :
                    <label htmlFor="dniReverso" className='border-dashed border rounded-lg  border-primary-100 w-full h-full items-center justify-center flex uppercase font-semibold  m-auto cursor-pointer hover:bg-primary-100/40 duration-300 hover:text-white text-xs'>
                        Dni Reverso
                        <input type="file" name='dniReverso' onChange={handleImageReverso} id='dniReverso' className='hidden' />
                    </label>}
            </div>
            <Button3 onClick={handleSubirDni}>Cargar</Button3>
        </div>
    );
}
