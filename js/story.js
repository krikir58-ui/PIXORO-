import { supabase } from '../supabase.js';

// Story paatha udane yaarukkum theriyama save aayidum - Secret!
export async function viewStory(storyId, ownerId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (user.id === ownerId) return; // Un story ah neeye paatha count koodathu da

  await supabase.from('story_views').insert({
    story_id: storyId,
    viewer_id: user.id,
    viewed_at: new Date().toISOString()
  });
  console.log("Secret view logged 👁️");
}

// Owner mattum paarkalam yaar paathanga nu!
export async function getStoryViewers(storyId) {
  const { data } = await supabase
    .from('story_views')
    .select('viewer_id, profiles(username)')
    .eq('story_id', storyId);
  return data;
  }
