import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function App() {
  const [posts, setPosts] = useState([])
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(false)

  // Posts ah edukka da Giri
  const getPosts = async () => {
    let { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    if (data) setPosts(data)
  }

  useEffect(() => { getPosts() }, [])

  // Add pannu da Giri - Instagram maari
  const addPost = async () => {
    if (!file) return alert("Photo select pannu da Giri!")
    setLoading(true)

    const fileName = Date.now() + "-" + file.name
    const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, file)
    if (uploadError) { alert(uploadError.message); setLoading(false); return }

    const { data } = supabase.storage.from('post-images').getPublicUrl(fileName)

    await supabase.from('posts').insert([{ image_url: data.publicUrl, caption: caption }])

    setCaption(""); setFile(null); setLoading(false); getPosts()
    alert("Post Add Aayiduchi da Giri!")
  }

  // Delete pannu da Giri
  const deletePost = async (id) => {
    await supabase.from('posts').delete().eq('id', id)
    getPosts()
  }

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center' }}>🔥 GIRI INSTA MASS 🔥</h1>

      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <input
          style={{ width: '100%', margin: '10px 0', padding: '8px' }}
          placeholder="Caption sollu da Giri..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button onClick={addPost} disabled={loading} style={{ width: '100%', padding: '10px', background: 'black', color: 'white', borderRadius: '5px' }}>
          {loading? "Uploading da..." : "POST ADD PANNU DA"}
        </button>
      </div>

      {posts.map(post => (
        <div key={post.id} style={{ border: '1px solid #ddd', marginBottom: '15px', borderRadius: '10px', overflow: 'hidden' }}>
          <img src={post.image_url} style={{ width: '100%' }} />
          <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <p>{post.caption}</p>
            <button onClick={() => deletePost(post.id)} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>DELETE DA</button>
          </div>
        </div>
      ))}
    </div>
  )
}
export default App
