import { supabase } from '../lib/supabaseClient.js'

/**
 * Generic helper to upload a media file (image / audio / video / document)
 * to the Supabase `evidence` bucket and return a public URL.
 *
 * @param {File} file - The file object to upload
 * @param {Object} options
 * @param {string} options.folder - Folder path inside bucket (e.g. "crime_reports", "missing_persons")
 * @param {string} options.userId - Current authenticated user id
 */
export async function uploadMedia(file, { folder, userId }) {
  if (!file || !userId) return null

  try {
    const ext = file.name?.split('.').pop() || 'dat'
    const safeFolder = folder || 'misc'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    const filePath = `${safeFolder}/${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(filePath, file)

    if (uploadError) {
      console.warn('Media upload failed:', uploadError.message)
      return null
    }

    const { data } = supabase.storage
      .from('evidence')
      .getPublicUrl(filePath)

    return data?.publicUrl || null
  } catch (err) {
    console.warn('Media upload error:', err.message)
    return null
  }
}


