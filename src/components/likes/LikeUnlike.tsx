import type { Post } from "@prisma/client";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { LoadingPage, LoadingSpinner } from "../loading";
import { LikeCount } from "./LikeCount";
import { LikePost } from "./LikePost";

type LikeUnlikeProps = {
    officialUserId: string | undefined,
    post: Post,
    userId: string
  }
  
export const LikeUnlike = (props: LikeUnlikeProps) => {
    const { post, officialUserId, userId } = props;
    const { data, isLoading } = api.likes.getUserLikes.useQuery({ userId: officialUserId! });
  
    const ctx = api.useContext();
  
    const userLikes = data !== undefined ? data?.some(f => f?.like.postId === post.id) : false;
  
    const { mutate: likePost, isLoading: isLiking } = api.likes.likePost.useMutation({
      onSuccess: () => {
        void ctx.likes.getUserLikes.invalidate();
        toast.success("Post Liked!")
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
  
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to post!")
        }
      }
    });
  
    const { mutate: deleteLike, isLoading: processingDelete } = api.likes.deleteLike.useMutation({
      onSuccess: () => {
        void ctx.likes.getUserLikes.invalidate();
        toast.success("Like Deleted!")
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
  
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to Delete!")
        }
      }
    });
  
    const likeToDelete = data?.find(f => f.like.postId === post.id)?.like.id
  
    const isLoggedInUsersLike = data?.find(f => f.like.postId === post.id)?.like.likerId === userId;
  
    const handleLike = () => {
  
      if (!userLikes) {
        likePost({ postId: post.id, authorId: post.authorId! })
      } else if (userLikes && isLoggedInUsersLike) {
        deleteLike({ likeId: likeToDelete })
      } else {
        toast.error("Unable to delete like.")
      }
    };
  
    if (!data || isLoading) return <LoadingPage />
  
    return (
      <button onClick={handleLike} disabled={isLiking || processingDelete}>
        {isLiking || processingDelete ?
          <div className="my-1.5">
            <LoadingSpinner />
          </div>
          :
          <div className="flex gap-3">
            <LikePost likedByUser={userLikes} />
            <span className="pt-1.5">
              <LikeCount postId={post.id} />
            </span>
          </div>}
      </button>
    )
  };
  