import { HeartIcon } from "@heroicons/react/24/outline"

type LikeButtonProps = {
    likedByUser: boolean
  }
  
export const LikePost = ({ likedByUser }: LikeButtonProps) => {
    return <button className="flex mt-1.5 transition-colors duration-200" >
      <HeartIcon className={`transition-colors duration-200 h-5 w-5 hover:fill-red-500 ${likedByUser ? 'fill-red-500' : ''}`} />
    </button>
  }
  