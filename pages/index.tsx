import { useState } from 'react'

import { PostFeed, MetaTags, Loader } from 'components'
import { firestore, fromMillis, postToJSON } from 'lib/firebase'
import { IPost } from 'types'

const LIMIT = 10 // Max post to query per page

interface IHome {
  postsProp: IPost[]
}

export default function Home({ postsProp }: IHome) {
  const [posts, setPosts] = useState(postsProp)
  const [loading, setLoading] = useState(false)

  const [postsEnd, setPostsEnd] = useState(false)

  const getMorePosts = async () => {
    setLoading(true)
    const last = posts[posts.length - 1]

    const cursor =
      typeof last.createdAt === 'number'
        ? fromMillis(last.createdAt)
        : last.createdAt

    const query = firestore
      .collectionGroup('posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .startAfter(cursor)
      .limit(LIMIT)

    const newPosts: any = (await query.get()).docs.map((doc) => doc.data())

    setPosts(posts.concat(newPosts))
    setLoading(false)

    if (newPosts.length < LIMIT) {
      setPostsEnd(true)
    }
  }

  return (
    <main>
      <MetaTags
        title="Home Page"
        description="Get the latest posts on our site"
      />

      <div className="card card-info">
        <h2>💡 Next.js + Firebase - The Full Course</h2>
        <p>
          Welcome! This app is built with Next.js and Firebase and is loosely
          inspired by Dev.to.
        </p>
        <p>
          Sign up for an 👨‍🎤 account, ✍️ write posts, then 💞 heart content
          created by other users. All public content is server-rendered and
          search-engine optimized.
        </p>
      </div>

      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  )
}

export async function getServerSideProps() {
  const postsQuery = firestore
    .collectionGroup('posts')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(LIMIT)

  const postsProp = (await postsQuery.get()).docs.map(postToJSON)

  return {
    props: { postsProp },
  }
}
