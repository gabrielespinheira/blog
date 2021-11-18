interface IPost {
  uid: string
  slug: string
  title: string
  content: string
  heartCount: number
  published: boolean
  createdAt: number | { seconds: number; nanoseconds: number }
  updatedAt: number | { seconds: number; nanoseconds: number }
  username: string
}

export default IPost
