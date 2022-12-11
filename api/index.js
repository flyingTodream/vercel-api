module.exports = (req, res) => {
  const { songName, artistsName, id } = req.query
  fs.exists(`./acc/${id}.mp3`, async (exists) => {
    if (exists) {
      res.send({
        status: 200,
        data: {
          source: '',
          url: `https://hua.flytodream.cn/musicApi/getUrl/${id}.mp3`
        }
      })
    } else {
      let d = null
      try {
        d = await getPlayUrl(songName, artistsName, id)
      } catch (error) {
      }
      res.send({
        status: 200,
        data: d
      })
    }
  });
}

