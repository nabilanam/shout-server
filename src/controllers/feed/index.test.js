const config = require('config')
const memoryDB = require('../../database/memory')
const controller = require('./index')
const User = require('../../models/User')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')

beforeAll(() => memoryDB.start(), config.get('timeout'))
afterAll(() => memoryDB.stop())

// add_post
describe('feed controller -> add_post', () => {
  let user = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: '123'
    }).save()

    done()
  })

  afterAll(() => user.remove())

  test('should resolve Response with (200, post) when (user_id, text)', () =>
    controller
      .add_post(user.id, 'lorem ipsum')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.user.toString()).toBe(user.id.toString())
        expect(response.data.text).toBe('lorem ipsum')
      })
      .catch(response => expect(response).toBeUndefined()))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (user_id)', () =>
    controller
      .add_post(user.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (text)', () =>
    controller
      .add_post('lorem ipsum')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when ()', () =>
    controller
      .add_post()
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))
})

// update_post
describe('feed controller -> update_post', () => {
  let user = null
  let other_user = null
  let post = null
  let removed_id = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: '123'
    }).save()

    other_user = await new User({
      username: 'mno',
      email: 'mno@mno.com',
      password: '123'
    }).save()

    post = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    const post2 = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    removed_id = post2.id

    await post2.remove()

    done()
  })

  afterAll(async done => {
    await user.remove()
    await post.remove()
    await other_user.remove()
    done()
  })

  test('should resolve Response with (200, post) when (user_id, post_id, text)', () =>
    controller
      .update_post(user.id, post.id, 'leet')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.text).toBe('leet')
      })
      .catch(response => expect(response).toBeUndefined()))

  test('should reject ErrorResponse with (404, post) when (user_id, removed post_id, text)', () =>
    controller
      .update_post(user.id, removed_id, 'leet')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(404)
        expect(response.error).toBe('Not found')
      }))

  test('should reject ErrorResponse with (403, \'Access denied\') when (another user_id)', () =>
    controller
      .update_post(other_user.id, post.id, 'leet')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(403)
        expect(response.error).toBe('Access denied')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (user_id, post_id)', () =>
    controller
      .update_post(user.id, post.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (only text)', () =>
    controller
      .update_post(undefined, undefined, 'leet')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))
})

// get_posts
describe('feed controller -> get_posts', () => {
  test('should resolve Response with (200, feed) when (page = 1)', () =>
    controller
      .get_posts(1)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data).toBeInstanceOf(Array)
      })
      .catch(response => expect(response).toBeUndefined()))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (page = 0)', () =>
    controller
      .get_posts(0)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))
})

// get_post
describe('feed controller -> get_post', () => {
  let user = null
  let post = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: '123'
    }).save()

    post = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    done()
  })

  afterAll(async done => {
    await user.remove()
    await post.remove()
    done()
  })

  test('should resolve Response with (200, post) when (post_id)', () =>
    controller
      .get_post(post.id)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data._id.toString()).toBe(post.id)
      })
      .catch(response => expect(response).toBeUndefined()))

  test('should reject ErrorResponse with (404, \'Not found\') when (invalid post_id)', () =>
    controller
      .get_post(12345)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(404)
        expect(response.error).toBe('Not found')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when ()', () =>
    controller
      .get_post()
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))
})

// remove_post
describe('feed controller -> remove_post', () => {
  let user = null
  let other_user = null
  let post = null
  let comment = null
  let removed_id = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: '123'
    }).save()

    other_user = await new User({
      username: 'mno',
      email: 'mno@mno.com',
      password: '123'
    }).save()

    post = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    comment = await new Comment({
      user: user.id,
      post: post.id,
      text: 'lipsum ipsum'
    }).save()

    const post2 = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    removed_id = post2.id

    await post2.remove()

    done()
  })

  afterAll(async done => {
    await user.remove()
    await post.remove()
    await comment.remove()
    await other_user.remove()
    done()
  })

  test('should reject ErrorResponse with (403, \'Access denied\') when (other user_id, post_id)', () =>
    controller
      .remove_post(other_user.id, post.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(403)
        expect(response.error).toBe('Access denied')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (user_id)', () =>
    controller
      .remove_post(user.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (post_id)', () =>
    controller
      .remove_post(undefined, post.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when ()', () =>
    controller
      .remove_post()
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (404, \'Not found\') when (user_id, removed post_id)', () =>
    controller
      .remove_post(user.id, removed_id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(404)
        expect(response.error).toBe('Not found')
      }))

  test('should resolve Response with (200, \'Post delete success\') when (user_id, post_id)', () =>
    controller
      .remove_post(user.id, post.id)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data).toBe('Post delete success')
      })
      .catch(response => expect(response).toBeUndefined()))
})

// like
describe('feed controller -> like', () => {
  let user = null
  let post = null
  let removed_id = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: '123'
    }).save()

    post = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    const post2 = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    removed_id = post2.id

    await post2.remove()

    done()
  })

  afterAll(async done => {
    await user.remove()
    await post.remove()
    done()
  })

  test('should resolve Response with (200, likes) when (user_id, post_id)', () =>
    controller
      .like(user.id, post.id)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.length).toBe(1)
        expect(response.data[0].user.username).toBe(user.username)
      })
      .catch(response => {
        expect(response).toBeUndefined()
      }))

  test('should resolve Response with (200, empty likes) when same (user_id, post_id)', () =>
    controller
      .like(user.id, post.id)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.length).toBe(0)
      })
      .catch(response => {
        expect(response).toBeUndefined()
      }))

  test('should reject ErrorResponse with (404, \'Not found\') when (user_id, removed post_id)', () =>
    controller
      .like(user.id, removed_id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(404)
        expect(response.error).toBe('Not found')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (user_id)', () =>
    controller
      .like(user.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (post_id)', () =>
    controller
      .like(undefined, post.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when ()', () =>
    controller
      .like()
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))
})

// add_comment
describe('feed controller -> add_comment', () => {
  let user = null
  let post = null
  let removed_id = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: '123'
    }).save()

    post = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    const post2 = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    removed_id = post2.id

    await post2.remove()

    done()
  })

  afterAll(async done => {
    await user.remove()
    await post.remove()
    await Comment.deleteMany({})
    done()
  })

  test('should resolve Response with (200, comments) when (user_id, post_id, text)', () =>
    controller
      .add_comment(user.id, post.id, 'dolor sit amet')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.length).toBe(1)
        expect(response.data[0].user.username).toBe(user.username)
      })
      .catch(response => {
        expect(response).toBeUndefined()
      }))

  test('should reject ErrorResponse with (404, \'Not found\') when (user_id, another post_id, text)', () =>
    controller
      .add_comment(user.id, removed_id, 'dolor sit amet')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(404)
        expect(response.error).toBe('Not found')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (user_id)', () =>
    controller
      .add_comment(user.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (post_id)', () =>
    controller
      .add_comment(undefined, post.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (text)', () =>
    controller
      .add_comment(undefined, undefined, 'dolor sit amet')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))
})

// update_comment
describe('feed controller -> update_comment', () => {
  let user = null
  let other_user = null
  let post = null
  let comment = null
  let removed_id = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: '123'
    }).save()

    other_user = await new User({
      username: 'mno',
      email: 'mno@mno.com',
      password: '123'
    }).save()

    post = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()
    await Comment.deleteMany({})

    comment = await new Comment({
      user: user.id,
      post: post.id,
      text: 'lipsum ipsum'
    }).save()

    post.comments = []
    post.comments.push(comment)
    await post.save()

    const post2 = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    removed_id = post2.id

    await post2.remove()

    done()
  })

  afterAll(async done => {
    await user.remove()
    await post.remove()
    await comment.remove()
    await other_user.remove()
    done()
  })

  test('should resolve Response with (200, comments) when (user_id, post_id, comment_id, text)', () =>
    controller
      .update_comment(user.id, post.id, comment.id, 'omini domini')
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.length).toBe(1)
        expect(response.data[0].text).toBe('omini domini')
        expect(response.data[0].user.username).toBe(user.username)
      })
      .catch(response => expect(response).toBeUndefined()))

  test('should reject ErrorResponse with (404, \'Not found\') when (user_id, post_id, removed comment_id, text)', () =>
    controller
      .update_comment(user.id, post.id, removed_id, 'omini domini')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(404)
        expect(response.error).toBe('Not found')
      }))

  test('should reject ErrorResponse with (403, \'Access denied\') when (user_id, another post_id, comment_id, text)', () =>
    controller
      .update_comment(user.id, removed_id, comment.id, 'omini domini')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(403)
        expect(response.error).toBe('Access denied')
      }))

  test('should reject ErrorResponse with (403, \'Access denied\') when (other user_id, post_id, comment_id, text)', () =>
    controller
      .update_comment(other_user.id, post.id, comment.id, 'bad comment')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(403)
        expect(response.error).toBe('Access denied')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (user_id)', () =>
    controller
      .update_comment(user.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (post_id)', () =>
    controller
      .update_comment(undefined, post.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (comment_id)', () =>
    controller
      .update_comment(undefined, undefined, comment.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (text)', () =>
    controller
      .update_comment(undefined, undefined, undefined, 'dolor sit amet')
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))
})

// remove_comment
describe('feed controller -> remove_comment', () => {
  let user = null
  let other_user = null
  let post = null
  let comment = null
  let removed_id = null

  beforeAll(async done => {
    user = await new User({
      username: 'abc',
      email: 'abc@abc.com',
      password: '123'
    }).save()

    other_user = await new User({
      username: 'mno',
      email: 'mno@mno.com',
      password: '123'
    }).save()

    post = await new Post({
      user: user.id,
      text: 'text text text'
    }).save()

    comment = await new Comment({
      user: user.id,
      post: post.id,
      text: 'lipsum ipsum'
    }).save()

    const comment2 = await new Comment({
      user: user.id,
      post: post.id,
      text: 'lipsum ipsum'
    }).save()

    removed_id = comment2.id

    await comment2.remove()

    done()
  })

  afterAll(async done => {
    await user.remove()
    await post.remove()
    await comment.remove()
    await other_user.remove()
    done()
  })

  test('should reject ErrorResponse with (404, \'Not found\') when (user_id, post_id, removed comment_id, text)', () =>
    controller
      .remove_comment(user.id, post.id, removed_id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(404)
        expect(response.error).toBe('Not found')
      }))

  test('should reject ErrorResponse with (403, \'Access denied\') when (other user_id, post_id, comment_id)', () =>
    controller
      .remove_comment(other_user.id, post.id, comment.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(403)
        expect(response.error).toBe('Access denied')
      }))

  test('should reject ErrorResponse with (403, \'Access denied\') when (user_id, another post_id, comment_id, text)', () =>
    controller
      .remove_comment(user.id, removed_id, comment.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(403)
        expect(response.error).toBe('Access denied')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (user_id)', () =>
    controller
      .remove_comment(user.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (post_id)', () =>
    controller
      .remove_comment(undefined, post.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should reject ErrorResponse with (400, \'Invalid request\') when (comment_id)', () =>
    controller
      .remove_comment(undefined, undefined, comment.id)
      .then(response => expect(response).toBeUndefined())
      .catch(response => {
        expect(response.status).toBe(400)
        expect(response.error).toBe('Invalid request')
      }))

  test('should resolve Response with (200, comments) when (user_id, post_id, comment_id)', () =>
    controller
      .remove_comment(user.id, post.id, comment.id)
      .then(response => {
        expect(response.status).toBe(200)
        expect(response.data.length).toBe(0)
      })
      .catch(response => expect(response).toBeUndefined()))
})
