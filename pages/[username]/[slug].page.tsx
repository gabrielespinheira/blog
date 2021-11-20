import { useDocumentData } from 'react-firebase-hooks/firestore'
import Link from 'next/link'

import styles from 'styles/Post.module.css'
import PostContent from 'components/PostContent'
import HeartButton from 'components/HeartButton'
import AuthCheck from 'components/AuthCheck'
import MetaTags from 'components/MetaTags'
import { firestore, getUserWithUsername, postToJSON } from 'services/firebase'
import { IPost } from 'types'
import { useAuth } from 'hooks'

export async function getStaticProps({ params }) {
  const { username, slug } = params
  const userDoc = await getUserWithUsername(username)

  let post
  let path

  if (userDoc) {
    const postRef = userDoc.ref.collection('posts').doc(slug)
    post = postToJSON(await postRef.get())

    path = postRef.path
  }

  return {
    props: { post, path },
    revalidate: 100,
  }
}

export async function getStaticPaths() {
  const snapshot = await firestore.collectionGroup('posts').get()

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data()
    return {
      params: { username, slug },
    }
  })

  return {
    paths,
    fallback: 'blocking',
  }
}

export default function Post(props) {
  const postRef = firestore.doc(props.path)
  const [realtimePost] = useDocumentData(postRef)

  const post: IPost = realtimePost || props.post

  const { user: currentUser } = useAuth()

  return (
    <main className={styles.container}>
      <MetaTags title={post.title} description={post.title} />

      <section>
        <PostContent post={post} />
      </section>

      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter" passHref>
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>

        {currentUser?.uid === post.uid && (
          <Link href={`/admin/${post.slug}`} passHref>
            <button className="btn-blue">Edit Post</button>
          </Link>
        )}
      </aside>
    </main>
  )
}
