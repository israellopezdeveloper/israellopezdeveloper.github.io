import React, { useState, useEffect } from 'react'
import { SimpleGrid } from '@chakra-ui/react'
import { ProjectGridItem } from './grid-item'
import axios from 'axios'

const RepoList = () => {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await axios.get('https://api.github.com/users/israellopezdeveloper/repos')
        const repoData = response.data

        const reposWithReadme = await Promise.all(
          repoData.map(async (repo) => {
            return { ...repo, readme: repo.html_url, thumbnail: `https://raw.githubusercontent.com/${repo.owner.login}/${repo.name}/main/.logo.png` }
          })
        )

        setRepos(reposWithReadme)
      } catch (error) {
        console.error('Error fetching repos or README.md files:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <SimpleGrid columns={[1, 1, 2]} gap={6}>
      {repos.map((repo) => (
        <ProjectGridItem key={repo.id}
          id={repo.readme}
          title={JSON.parse(repo.description).es.name}
          thumbnail={repo.thumbnail}>
          {JSON.parse(repo.description).es.desc}
        </ProjectGridItem>
      ))}
    </SimpleGrid>
  )
}

export default RepoList

