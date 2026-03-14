import { supabase } from '../lib/supabaseClient.js'

export async function submitCrimeReport({ type, location, date, description, file, category }) {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error('User not authenticated. Please log in.')

    let fileUrl = null

    // Upload file to Supabase Storage if provided
    if (file) {
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `evidence_files/${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, file)

        if (uploadError) {
          // If bucket doesn't exist, continue without file upload
          console.warn('Storage upload failed:', uploadError.message)
        } else {
          const { data } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath)
          fileUrl = data?.publicUrl || null
        }
      } catch (storageError) {
        // Continue without file if storage fails
        console.warn('File upload skipped:', storageError.message)
      }
    }

    // Insert report into database
    const { error: insertError } = await supabase
      .from('crime_reports')
      .insert({
        type,
        location,
        date,
        description,
        category: category || 'other',
        file_url: fileUrl,
        user_id: user.id,
      })

    if (insertError) {
      // Provide more helpful error messages
      if (insertError.code === 'PGRST116') {
        throw new Error('Database table not found. Please create the crime_reports table in Supabase.')
      }
      throw insertError
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to submit crime report')
  }
}
