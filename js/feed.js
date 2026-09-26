import SystemAd from "./SystemAd"

function Feed({ posts }) {
  return (
    <div>
      {posts.map((post, index) => (
        <div key={post.id}>
          {/* Normal Post */}
          <PostCard post={post} />

          {/* Ovvoro 5 post ku aprom Ad kaamikkanum da! */}
          {(index + 1) % 5 === 0 && <SystemAd />}
        </div>
      ))}
    </div>
  )
}
