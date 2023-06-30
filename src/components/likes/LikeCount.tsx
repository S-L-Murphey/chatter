import { api } from "~/utils/api";
import { LoadingSpinner } from "../loading";

type LikeCountProps = {
    postId: string
  }

export const LikeCount = ({ postId }: LikeCountProps) => {
    
    const { data, isLoading } = api.likes.getLikesByPostId.useQuery({ postId });
    const likeCount = data?.length;
  
    if (isLoading) return <LoadingSpinner />
  
    return (
        <div className="text-slate-400 text-sm">{likeCount}</div>
    )
  };