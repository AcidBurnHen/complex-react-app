import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfileFollowing() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [followings, setFollowings] = useState([]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchFollowings() {
      try {
        const response = await Axios.get(`/profile/${username}/following`, { cancelToken: ourRequest.token });
        setFollowings(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log(e.response.data);
      }
    }

    fetchFollowings();
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {followings.map((following, index) => {
        return (
          <Link key={index} to={`/profile/${following.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={following.avatar} /> {following.username}
          </Link>
        );
      })}
    </div>
  );
}

export default ProfileFollowing;
