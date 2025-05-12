import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { getAllVideosByUser } from "@/lib/actions/video";
import { redirect } from "next/navigation";
import EmptyState from "@/components/emptyState";

const Page = async ({params,searchParams}:ParamsWithSearch) => {

    const {id} = await params;
    const {query,filter} = await searchParams;

    const {user,videos}= await getAllVideosByUser(id,query,filter);

    if(!user){
        return redirect('/404');
    }
    return (
      <div className="wrapper page">
        <Header title=
        {user?.name} subHeader={user?.email} userImg={user?.image || "/assets/images/dummy.jpg"} />
        
        {videos?.length > 0 ?(
                <section className='video-grid'>
                    {videos.map(({video,user})=>(
                        <VideoCard
                        key={video.id}
                        id={video.videoId}
                        title={video.title}
                        thumbnail={video.thumbnailUrl}
                        createdAt={video.createdAt}
                        userImg={user?.image ?? ""}
                        username={user?.name ?? "Guest"}
                        views={video.views}
                        visibility={video.visibility}
                        duration={video.duration}
                      />
                    ))}
                </section>
            ):(
                <EmptyState
                icon={'/assets/icons/video.svg'}
                title='No videos available yet !'
                description='Start creating your first video by clicking the record button above'
                />
            )}
        </div>  
    )
}

export default Page;