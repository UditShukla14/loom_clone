'use client'
import FileInput from '@/components/FileInput'
import FormField from '@/components/FormField'
import { useFileInput } from '@/lib/hooks/useFileInput'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { MAX_VIDEO_SIZE, MAX_THUMBNAIL_SIZE } from '@/constants';
import { getThumbnailUploadUrl, getVideoUploadUrl, saveVideoDetails } from '@/lib/actions/video'
import { useRouter } from 'next/navigation'

const uploadFileToBunny = async (uploadUrl:string, accessKey:string, file:File):Promise<void>=>{
    return fetch(uploadUrl, {
        method:'PUT',
        headers:{
            'Content-Type':file.type,
            'AccessKey':accessKey,
        },
        body:file,
    }).then((res)=>{
        if(!res.ok){
            throw new Error('Failed to upload file to bunny!');
        }
    })
}
const Page = () => {
    const router=useRouter();
    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const [error, setError] = useState<string | null>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const video = useFileInput(MAX_VIDEO_SIZE);
    const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'public' as 'public' | 'private',
    });

    useEffect(()=>{
        if(!video.duration !== null || 0 ){
            setVideoDuration(video.duration);
        }
    },[video.duration])

    useEffect(()=>{
        const checkForRecordedVideo = async()=>{
            try{
                const stored = sessionStorage.getItem('recordedVideo');
                if(!stored){
                    return;
                }
                const {url,name,type,duration} = JSON.parse(stored);

                const blob = await fetch(url).then((res)=>res.blob());
                const file = new File([blob], name, {type,lastModified:Date.now()});
               
                if(video.inputRef.current){
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    video.inputRef.current.files = dataTransfer.files;
                    
                    // dispatch a custom change event 
                    const event = new Event('change', {bubbles:true});
                    video.inputRef.current.dispatchEvent(event);

                    video.handleFileChange({
                        target:{
                            files:dataTransfer.files,
                        }
                    }  as ChangeEvent<HTMLInputElement>);
                }
                
                if(duration) setVideoDuration(duration);

                sessionStorage.removeItem('recordedVideo');
                URL.revokeObjectURL(url);
            }
            catch(e){
                console.error('Error loading recorded video', e);
            }
        }
        checkForRecordedVideo()
    },[video])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    }

    const handleSubmit = async(e: FormEvent)=>{
        e.preventDefault();
        setIsSubmitting(true);
        try{
            if(!video.file || !thumbnail.file){
                setError('Please upload a video and a thumbnail');
                return;
            }

            if(!formData.title || !formData.description){
                setError('Please fill in all the fields');
                return;
            }

            // upload video to bunny
            const {videoId, uploadUrl:videoUploadUrl, accessKey:videoAccessKey} = await getVideoUploadUrl();

            if(!videoUploadUrl || !videoAccessKey){
                throw new Error('Failed to get video upload credentials!');
            }
            
            await uploadFileToBunny( videoUploadUrl, videoAccessKey, video.file);

            // upload thumbnail to bunny
            const {uploadUrl:thumbnailUploadUrl, accessKey:thumbnailAccessKey,cdnUrl:thumbnailCdnUrl} = await getThumbnailUploadUrl(videoId);

            if(!thumbnailUploadUrl || !thumbnailAccessKey || !thumbnailCdnUrl){
                throw new Error('Failed to get thumbnail upload credentials!');
            }

              // attach video to thumbnail
            await uploadFileToBunny(thumbnailUploadUrl, thumbnailAccessKey, thumbnail.file);
            
            // create a new db entry for video detals (urls, metadata)
            await saveVideoDetails({
                videoId,
                ...formData,
                thumbnailUrl:thumbnailCdnUrl,
                duration:videoDuration,  
            })
            router.push(`/`);
        }
        catch(error){
            console.log("Error submitting form", error);
        }
        finally {
            setIsSubmitting(false);
        }
        
    }
  return (
    <div className='wrapper-md upload-page'>
        <h1>Upload a video</h1>
        {error &&<div className='error-field'>{error}</div>}

        <form className='rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5' onSubmit={handleSubmit}>

        
        <FormField
        id='title'
        label='Title'
        value={formData.title}
        onChange={handleInputChange}
        placeholder='Enter a clear and concise video title '
        />
        <FormField
        id='description'
        label='Description'
        value={formData.description}
        onChange={handleInputChange}
        placeholder='Describe what this video is about '
        as='textarea'
        />

        <FileInput 
        id="video"
        label="video"
        accept='video/*'
        file={video.file}
        previewUrl={video.previewUrl}
        inputRef={video.inputRef}
        onChange={video.handleFileChange}
        onReset={video.resetFile}
        type='video'
        />
        <FileInput 
        id="thumbnail"
        label="Thumbnail"
        accept='image/*'
        file={thumbnail.file}
        previewUrl={thumbnail.previewUrl}
        inputRef={thumbnail.inputRef}
        onChange={thumbnail.handleFileChange}
        onReset={thumbnail.resetFile}
        type='image'
        />

        <FormField
        id='visibility'
        label='Visibility'
        value={formData.visibility}
        onChange={handleInputChange}
        options={[{value: 'public', label: 'Public'}, {value: 'private', label: 'Private'}]}
        as='select'
        />
        <button type='submit' disabled={isSubmitting} className='submit-button'> 
            {isSubmitting ? 'Uploading...' : 'Upload video'}
        </button>
        </form>
    </div>
  )
}

export default Page