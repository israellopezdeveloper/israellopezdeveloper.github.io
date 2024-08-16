import { Container, Heading, SimpleGrid, Divider, Box, WrapItem, Wrap, useColorModeValue } from '@chakra-ui/react'
import Layout from '../components/layouts/article'
import Section from '../components/section'
import { ProjectGridItem, WorkGridItem } from '../components/grid-item'
import { useContext, useEffect, useMemo, useState } from 'react'
import { VoxelKoalaContext } from '../components/layouts/main'
import TechBadge from '../components/techbadge'
import moment from 'moment'
import cvDataEN from '../data/CV.en.json'
import cvDataENS from '../data/CV.en.s.json'
import cvDataES from '../data/CV.es.json'
import cvDataESS from '../data/CV.es.s.json'
import cvDataZH from '../data/CV.zh.json'
import cvDataZHS from '../data/CV.zh.s.json'
import guiEN from '../data/gui.en.json'
import guiES from '../data/gui.es.json'
import guiZH from '../data/gui.zh.json'
import { useLanguage } from '../components/context/language_context'
import axios from 'axios'

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    // Función para actualizar el estado con el tamaño de la ventana
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Añadir event listener
    window.addEventListener("resize", handleResize)

    // Llamar a la función handleResize inmediatamente para establecer el tamaño inicial
    handleResize()

    // Limpiar event listener al desmontar
    return () => window.removeEventListener("resize", handleResize)
  }, []); // Array vacío para que solo se ejecute al montar y desmontar
  return windowSize
}

async function fetchRepos() {
  const test = true
  if (!test) {
    try {
      const response = await axios.get('https://api.github.com/users/israellopezdeveloper/repos')
      const repoData = response.data
      console.log("repoData", repoData)

      const reposFilled = await Promise.all(
        repoData.map(async (repo) => {
          const startDate = new Date(repo.created_at)

          // Fecha actual
          const currentDate = new Date()

          // Calcula la diferencia en años y meses
          const yearsDiff = currentDate.getFullYear() - startDate.getFullYear()
          const monthsDiff = currentDate.getMonth() - startDate.getMonth()

          // Calcula el número total de meses
          let totalMonths = yearsDiff * 12 + monthsDiff
          totalMonths = (totalMonths === 0 ? 1 : totalMonths)
          let techs = await axios.get(repo.languages_url)
          techs = Object.keys(techs.data)
          let nitem = {}
          try {
            const data = await axios.get(repo.html_url.replace("github.com", "raw.githubusercontent.com") + "/metadata-branch/metadata.json")
            nitem = data.data
            nitem.url = repo.html_url
            nitem.thumbnail = repo.html_url.replace("github.com", "raw.githubusercontent.com") + "/metadata-branch/logo.png"
            techs = [...new Set([...(techs || []), ...(nitem.technologies || [])])]
            nitem.technologies = techs.map((item) => {
              return {
                'tech': item,
                'time': totalMonths
              }
            })
          } catch (error) {
            // Manejar error si es necesario
          }
          return nitem
        })
      )

      return reposFilled
    } catch (error) {
    } finally {
    }
  } else {
    const repoData = [
      {
        "id": 841351477,
        "node_id": "R_kgDOMiYBNQ",
        "name": ".github",
        "full_name": "israellopezdeveloper/.github",
        "private": false,
        "owner": {
          "login": "israellopezdeveloper",
          "id": 25364734,
          "node_id": "MDQ6VXNlcjI1MzY0NzM0",
          "avatar_url": "https://avatars.githubusercontent.com/u/25364734?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/israellopezdeveloper",
          "html_url": "https://github.com/israellopezdeveloper",
          "followers_url": "https://api.github.com/users/israellopezdeveloper/followers",
          "following_url": "https://api.github.com/users/israellopezdeveloper/following{/other_user}",
          "gists_url": "https://api.github.com/users/israellopezdeveloper/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/israellopezdeveloper/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/israellopezdeveloper/subscriptions",
          "organizations_url": "https://api.github.com/users/israellopezdeveloper/orgs",
          "repos_url": "https://api.github.com/users/israellopezdeveloper/repos",
          "events_url": "https://api.github.com/users/israellopezdeveloper/events{/privacy}",
          "received_events_url": "https://api.github.com/users/israellopezdeveloper/received_events",
          "type": "User",
          "site_admin": false
        },
        "html_url": "https://github.com/israellopezdeveloper/.github",
        "description": "Default community health files",
        "fork": false,
        "url": "https://api.github.com/repos/israellopezdeveloper/.github",
        "forks_url": "https://api.github.com/repos/israellopezdeveloper/.github/forks",
        "keys_url": "https://api.github.com/repos/israellopezdeveloper/.github/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/israellopezdeveloper/.github/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/israellopezdeveloper/.github/teams",
        "hooks_url": "https://api.github.com/repos/israellopezdeveloper/.github/hooks",
        "issue_events_url": "https://api.github.com/repos/israellopezdeveloper/.github/issues/events{/number}",
        "events_url": "https://api.github.com/repos/israellopezdeveloper/.github/events",
        "assignees_url": "https://api.github.com/repos/israellopezdeveloper/.github/assignees{/user}",
        "branches_url": "https://api.github.com/repos/israellopezdeveloper/.github/branches{/branch}",
        "tags_url": "https://api.github.com/repos/israellopezdeveloper/.github/tags",
        "blobs_url": "https://api.github.com/repos/israellopezdeveloper/.github/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/israellopezdeveloper/.github/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/israellopezdeveloper/.github/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/israellopezdeveloper/.github/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/israellopezdeveloper/.github/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/israellopezdeveloper/.github/languages",
        "stargazers_url": "https://api.github.com/repos/israellopezdeveloper/.github/stargazers",
        "contributors_url": "https://api.github.com/repos/israellopezdeveloper/.github/contributors",
        "subscribers_url": "https://api.github.com/repos/israellopezdeveloper/.github/subscribers",
        "subscription_url": "https://api.github.com/repos/israellopezdeveloper/.github/subscription",
        "commits_url": "https://api.github.com/repos/israellopezdeveloper/.github/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/israellopezdeveloper/.github/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/israellopezdeveloper/.github/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/israellopezdeveloper/.github/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/israellopezdeveloper/.github/contents/{+path}",
        "compare_url": "https://api.github.com/repos/israellopezdeveloper/.github/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/israellopezdeveloper/.github/merges",
        "archive_url": "https://api.github.com/repos/israellopezdeveloper/.github/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/israellopezdeveloper/.github/downloads",
        "issues_url": "https://api.github.com/repos/israellopezdeveloper/.github/issues{/number}",
        "pulls_url": "https://api.github.com/repos/israellopezdeveloper/.github/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/israellopezdeveloper/.github/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/israellopezdeveloper/.github/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/israellopezdeveloper/.github/labels{/name}",
        "releases_url": "https://api.github.com/repos/israellopezdeveloper/.github/releases{/id}",
        "deployments_url": "https://api.github.com/repos/israellopezdeveloper/.github/deployments",
        "created_at": "2024-08-12T08:30:57Z",
        "updated_at": "2024-08-12T08:35:37Z",
        "pushed_at": "2024-08-12T08:35:34Z",
        "git_url": "git://github.com/israellopezdeveloper/.github.git",
        "ssh_url": "git@github.com:israellopezdeveloper/.github.git",
        "clone_url": "https://github.com/israellopezdeveloper/.github.git",
        "svn_url": "https://github.com/israellopezdeveloper/.github",
        "homepage": null,
        "size": 4,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": null,
        "has_issues": true,
        "has_projects": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": false,
        "has_discussions": false,
        "forks_count": 0,
        "mirror_url": null,
        "archived": false,
        "disabled": false,
        "open_issues_count": 0,
        "license": null,
        "allow_forking": true,
        "is_template": false,
        "web_commit_signoff_required": false,
        "topics": [],
        "visibility": "public",
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "main"
      },
      {
        "id": 837935943,
        "node_id": "R_kgDOMfHjRw",
        "name": "israellopezdeveloper.github.io",
        "full_name": "israellopezdeveloper/israellopezdeveloper.github.io",
        "private": false,
        "owner": {
          "login": "israellopezdeveloper",
          "id": 25364734,
          "node_id": "MDQ6VXNlcjI1MzY0NzM0",
          "avatar_url": "https://avatars.githubusercontent.com/u/25364734?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/israellopezdeveloper",
          "html_url": "https://github.com/israellopezdeveloper",
          "followers_url": "https://api.github.com/users/israellopezdeveloper/followers",
          "following_url": "https://api.github.com/users/israellopezdeveloper/following{/other_user}",
          "gists_url": "https://api.github.com/users/israellopezdeveloper/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/israellopezdeveloper/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/israellopezdeveloper/subscriptions",
          "organizations_url": "https://api.github.com/users/israellopezdeveloper/orgs",
          "repos_url": "https://api.github.com/users/israellopezdeveloper/repos",
          "events_url": "https://api.github.com/users/israellopezdeveloper/events{/privacy}",
          "received_events_url": "https://api.github.com/users/israellopezdeveloper/received_events",
          "type": "User",
          "site_admin": false
        },
        "html_url": "https://github.com/israellopezdeveloper/israellopezdeveloper.github.io",
        "description": "{   \"es\": {     \"name\": \"Mi portfolio\",     \"desc\": \"Código fuente de mi portfolio\"   },   \"en\": {     \"name\": \"My portfolio\",     \"desc\": \"Source code of my portfolio\"   } }",
        "fork": false,
        "url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io",
        "forks_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/forks",
        "keys_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/teams",
        "hooks_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/hooks",
        "issue_events_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/issues/events{/number}",
        "events_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/events",
        "assignees_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/assignees{/user}",
        "branches_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/branches{/branch}",
        "tags_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/tags",
        "blobs_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/languages",
        "stargazers_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/stargazers",
        "contributors_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/contributors",
        "subscribers_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/subscribers",
        "subscription_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/subscription",
        "commits_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/contents/{+path}",
        "compare_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/merges",
        "archive_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/downloads",
        "issues_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/issues{/number}",
        "pulls_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/labels{/name}",
        "releases_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/releases{/id}",
        "deployments_url": "https://api.github.com/repos/israellopezdeveloper/israellopezdeveloper.github.io/deployments",
        "created_at": "2024-08-04T13:39:29Z",
        "updated_at": "2024-08-09T12:56:31Z",
        "pushed_at": "2024-08-14T09:04:31Z",
        "git_url": "git://github.com/israellopezdeveloper/israellopezdeveloper.github.io.git",
        "ssh_url": "git@github.com:israellopezdeveloper/israellopezdeveloper.github.io.git",
        "clone_url": "https://github.com/israellopezdeveloper/israellopezdeveloper.github.io.git",
        "svn_url": "https://github.com/israellopezdeveloper/israellopezdeveloper.github.io",
        "homepage": "",
        "size": 92895,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "JavaScript",
        "has_issues": true,
        "has_projects": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": true,
        "has_discussions": false,
        "forks_count": 0,
        "mirror_url": null,
        "archived": false,
        "disabled": false,
        "open_issues_count": 0,
        "license": {
          "key": "mit",
          "name": "MIT License",
          "spdx_id": "MIT",
          "url": "https://api.github.com/licenses/mit",
          "node_id": "MDc6TGljZW5zZTEz"
        },
        "allow_forking": true,
        "is_template": false,
        "web_commit_signoff_required": false,
        "topics": [],
        "visibility": "public",
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "main"
      },
      {
        "id": 841856638,
        "node_id": "R_kgDOMi22fg",
        "name": "nanologger",
        "full_name": "israellopezdeveloper/nanologger",
        "private": false,
        "owner": {
          "login": "israellopezdeveloper",
          "id": 25364734,
          "node_id": "MDQ6VXNlcjI1MzY0NzM0",
          "avatar_url": "https://avatars.githubusercontent.com/u/25364734?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/israellopezdeveloper",
          "html_url": "https://github.com/israellopezdeveloper",
          "followers_url": "https://api.github.com/users/israellopezdeveloper/followers",
          "following_url": "https://api.github.com/users/israellopezdeveloper/following{/other_user}",
          "gists_url": "https://api.github.com/users/israellopezdeveloper/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/israellopezdeveloper/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/israellopezdeveloper/subscriptions",
          "organizations_url": "https://api.github.com/users/israellopezdeveloper/orgs",
          "repos_url": "https://api.github.com/users/israellopezdeveloper/repos",
          "events_url": "https://api.github.com/users/israellopezdeveloper/events{/privacy}",
          "received_events_url": "https://api.github.com/users/israellopezdeveloper/received_events",
          "type": "User",
          "site_admin": false
        },
        "html_url": "https://github.com/israellopezdeveloper/nanologger",
        "description": "A lightweight logger for C designed to minimize impact on your codebase by utilizing macros. It enables detailed tracing of execution, including precise tracking of when and which thread is running at any given moment. Ideal for developers seeking minimal overhead with comprehensive logging capabilities.",
        "fork": false,
        "url": "https://api.github.com/repos/israellopezdeveloper/nanologger",
        "forks_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/forks",
        "keys_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/teams",
        "hooks_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/hooks",
        "issue_events_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/issues/events{/number}",
        "events_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/events",
        "assignees_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/assignees{/user}",
        "branches_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/branches{/branch}",
        "tags_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/tags",
        "blobs_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/languages",
        "stargazers_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/stargazers",
        "contributors_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/contributors",
        "subscribers_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/subscribers",
        "subscription_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/subscription",
        "commits_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/contents/{+path}",
        "compare_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/merges",
        "archive_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/downloads",
        "issues_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/issues{/number}",
        "pulls_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/labels{/name}",
        "releases_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/releases{/id}",
        "deployments_url": "https://api.github.com/repos/israellopezdeveloper/nanologger/deployments",
        "created_at": "2024-08-13T07:19:47Z",
        "updated_at": "2024-08-13T14:29:32Z",
        "pushed_at": "2024-08-13T14:38:15Z",
        "git_url": "git://github.com/israellopezdeveloper/nanologger.git",
        "ssh_url": "git@github.com:israellopezdeveloper/nanologger.git",
        "clone_url": "https://github.com/israellopezdeveloper/nanologger.git",
        "svn_url": "https://github.com/israellopezdeveloper/nanologger",
        "homepage": null,
        "size": 453,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "C",
        "has_issues": true,
        "has_projects": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": false,
        "has_discussions": false,
        "forks_count": 0,
        "mirror_url": null,
        "archived": false,
        "disabled": false,
        "open_issues_count": 0,
        "license": {
          "key": "mit",
          "name": "MIT License",
          "spdx_id": "MIT",
          "url": "https://api.github.com/licenses/mit",
          "node_id": "MDc6TGljZW5zZTEz"
        },
        "allow_forking": true,
        "is_template": false,
        "web_commit_signoff_required": false,
        "topics": [],
        "visibility": "public",
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "main"
      },
      {
        "id": 841876692,
        "node_id": "R_kgDOMi4E1A",
        "name": "saurion",
        "full_name": "israellopezdeveloper/saurion",
        "private": false,
        "owner": {
          "login": "israellopezdeveloper",
          "id": 25364734,
          "node_id": "MDQ6VXNlcjI1MzY0NzM0",
          "avatar_url": "https://avatars.githubusercontent.com/u/25364734?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/israellopezdeveloper",
          "html_url": "https://github.com/israellopezdeveloper",
          "followers_url": "https://api.github.com/users/israellopezdeveloper/followers",
          "following_url": "https://api.github.com/users/israellopezdeveloper/following{/other_user}",
          "gists_url": "https://api.github.com/users/israellopezdeveloper/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/israellopezdeveloper/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/israellopezdeveloper/subscriptions",
          "organizations_url": "https://api.github.com/users/israellopezdeveloper/orgs",
          "repos_url": "https://api.github.com/users/israellopezdeveloper/repos",
          "events_url": "https://api.github.com/users/israellopezdeveloper/events{/privacy}",
          "received_events_url": "https://api.github.com/users/israellopezdeveloper/received_events",
          "type": "User",
          "site_admin": false
        },
        "html_url": "https://github.com/israellopezdeveloper/saurion",
        "description": "This C project leverages **liburing** and a **threadpool** to asynchronously manage a socket in high-concurrency environments. Designed to be minimalist, it efficiently handles multiple simultaneous connections with minimal overhead, making it ideal for performance-critical applications in busy systems.",
        "fork": false,
        "url": "https://api.github.com/repos/israellopezdeveloper/saurion",
        "forks_url": "https://api.github.com/repos/israellopezdeveloper/saurion/forks",
        "keys_url": "https://api.github.com/repos/israellopezdeveloper/saurion/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/israellopezdeveloper/saurion/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/israellopezdeveloper/saurion/teams",
        "hooks_url": "https://api.github.com/repos/israellopezdeveloper/saurion/hooks",
        "issue_events_url": "https://api.github.com/repos/israellopezdeveloper/saurion/issues/events{/number}",
        "events_url": "https://api.github.com/repos/israellopezdeveloper/saurion/events",
        "assignees_url": "https://api.github.com/repos/israellopezdeveloper/saurion/assignees{/user}",
        "branches_url": "https://api.github.com/repos/israellopezdeveloper/saurion/branches{/branch}",
        "tags_url": "https://api.github.com/repos/israellopezdeveloper/saurion/tags",
        "blobs_url": "https://api.github.com/repos/israellopezdeveloper/saurion/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/israellopezdeveloper/saurion/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/israellopezdeveloper/saurion/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/israellopezdeveloper/saurion/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/israellopezdeveloper/saurion/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/israellopezdeveloper/saurion/languages",
        "stargazers_url": "https://api.github.com/repos/israellopezdeveloper/saurion/stargazers",
        "contributors_url": "https://api.github.com/repos/israellopezdeveloper/saurion/contributors",
        "subscribers_url": "https://api.github.com/repos/israellopezdeveloper/saurion/subscribers",
        "subscription_url": "https://api.github.com/repos/israellopezdeveloper/saurion/subscription",
        "commits_url": "https://api.github.com/repos/israellopezdeveloper/saurion/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/israellopezdeveloper/saurion/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/israellopezdeveloper/saurion/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/israellopezdeveloper/saurion/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/israellopezdeveloper/saurion/contents/{+path}",
        "compare_url": "https://api.github.com/repos/israellopezdeveloper/saurion/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/israellopezdeveloper/saurion/merges",
        "archive_url": "https://api.github.com/repos/israellopezdeveloper/saurion/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/israellopezdeveloper/saurion/downloads",
        "issues_url": "https://api.github.com/repos/israellopezdeveloper/saurion/issues{/number}",
        "pulls_url": "https://api.github.com/repos/israellopezdeveloper/saurion/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/israellopezdeveloper/saurion/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/israellopezdeveloper/saurion/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/israellopezdeveloper/saurion/labels{/name}",
        "releases_url": "https://api.github.com/repos/israellopezdeveloper/saurion/releases{/id}",
        "deployments_url": "https://api.github.com/repos/israellopezdeveloper/saurion/deployments",
        "created_at": "2024-08-13T08:15:22Z",
        "updated_at": "2024-08-13T08:57:22Z",
        "pushed_at": "2024-08-14T07:31:53Z",
        "git_url": "git://github.com/israellopezdeveloper/saurion.git",
        "ssh_url": "git@github.com:israellopezdeveloper/saurion.git",
        "clone_url": "https://github.com/israellopezdeveloper/saurion.git",
        "svn_url": "https://github.com/israellopezdeveloper/saurion",
        "homepage": "",
        "size": 6396,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "C",
        "has_issues": true,
        "has_projects": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": false,
        "has_discussions": false,
        "forks_count": 0,
        "mirror_url": null,
        "archived": false,
        "disabled": false,
        "open_issues_count": 1,
        "license": {
          "key": "mit",
          "name": "MIT License",
          "spdx_id": "MIT",
          "url": "https://api.github.com/licenses/mit",
          "node_id": "MDc6TGljZW5zZTEz"
        },
        "allow_forking": true,
        "is_template": false,
        "web_commit_signoff_required": false,
        "topics": [],
        "visibility": "public",
        "forks": 0,
        "open_issues": 1,
        "watchers": 0,
        "default_branch": "main"
      },
      {
        "id": 841414130,
        "node_id": "R_kgDOMib18g",
        "name": "scaffold",
        "full_name": "israellopezdeveloper/scaffold",
        "private": false,
        "owner": {
          "login": "israellopezdeveloper",
          "id": 25364734,
          "node_id": "MDQ6VXNlcjI1MzY0NzM0",
          "avatar_url": "https://avatars.githubusercontent.com/u/25364734?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/israellopezdeveloper",
          "html_url": "https://github.com/israellopezdeveloper",
          "followers_url": "https://api.github.com/users/israellopezdeveloper/followers",
          "following_url": "https://api.github.com/users/israellopezdeveloper/following{/other_user}",
          "gists_url": "https://api.github.com/users/israellopezdeveloper/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/israellopezdeveloper/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/israellopezdeveloper/subscriptions",
          "organizations_url": "https://api.github.com/users/israellopezdeveloper/orgs",
          "repos_url": "https://api.github.com/users/israellopezdeveloper/repos",
          "events_url": "https://api.github.com/users/israellopezdeveloper/events{/privacy}",
          "received_events_url": "https://api.github.com/users/israellopezdeveloper/received_events",
          "type": "User",
          "site_admin": false
        },
        "html_url": "https://github.com/israellopezdeveloper/scaffold",
        "description": "This repository stablish an scaffold for C/C++ proyects",
        "fork": false,
        "url": "https://api.github.com/repos/israellopezdeveloper/scaffold",
        "forks_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/forks",
        "keys_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/teams",
        "hooks_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/hooks",
        "issue_events_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/issues/events{/number}",
        "events_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/events",
        "assignees_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/assignees{/user}",
        "branches_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/branches{/branch}",
        "tags_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/tags",
        "blobs_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/languages",
        "stargazers_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/stargazers",
        "contributors_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/contributors",
        "subscribers_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/subscribers",
        "subscription_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/subscription",
        "commits_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/contents/{+path}",
        "compare_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/merges",
        "archive_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/downloads",
        "issues_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/issues{/number}",
        "pulls_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/labels{/name}",
        "releases_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/releases{/id}",
        "deployments_url": "https://api.github.com/repos/israellopezdeveloper/scaffold/deployments",
        "created_at": "2024-08-12T11:08:00Z",
        "updated_at": "2024-08-14T07:29:39Z",
        "pushed_at": "2024-08-14T07:29:40Z",
        "git_url": "git://github.com/israellopezdeveloper/scaffold.git",
        "ssh_url": "git@github.com:israellopezdeveloper/scaffold.git",
        "clone_url": "https://github.com/israellopezdeveloper/scaffold.git",
        "svn_url": "https://github.com/israellopezdeveloper/scaffold",
        "homepage": null,
        "size": 935,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "Makefile",
        "has_issues": true,
        "has_projects": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": false,
        "has_discussions": false,
        "forks_count": 0,
        "mirror_url": null,
        "archived": false,
        "disabled": false,
        "open_issues_count": 0,
        "license": null,
        "allow_forking": true,
        "is_template": false,
        "web_commit_signoff_required": false,
        "topics": [],
        "visibility": "public",
        "forks": 0,
        "open_issues": 0,
        "watchers": 0,
        "default_branch": "main"
      }
    ]
    const output = []
    for (const repo of repoData) {
      const startDate = new Date(repo.created_at)

      // Fecha actual
      const currentDate = new Date()

      // Calcula la diferencia en años y meses
      const yearsDiff = currentDate.getFullYear() - startDate.getFullYear()
      const monthsDiff = currentDate.getMonth() - startDate.getMonth()

      // Calcula el número total de meses
      let totalMonths = yearsDiff * 12 + monthsDiff
      totalMonths = (totalMonths === 0 ? 1 : totalMonths)
      //let techs = await axios.get(repo.languages_url)
      //techs = Object.keys(techs.data)
      let techs = ["C"]
      try {
        const data = await axios.get(repo.html_url.replace("github.com", "raw.githubusercontent.com") + "/metadata-branch/metadata.json")
        let nitem = data.data
        nitem.url = repo.html_url
        nitem.thumbnail = repo.html_url.replace("github.com", "raw.githubusercontent.com") + "/metadata-branch/logo.png"
        techs = [...new Set([...(techs || []), ...(nitem.technologies || [])])]
        nitem.technologies = techs.map((item) => {
          return {
            'tech': item,
            'time': totalMonths
          }
        })
        output.push(nitem)
      } catch (error) {
        // Manejar error si es necesario
      }
    }
    return output
  }
}

let repos = []

fetchRepos().then(r => repos = r)

const Works = () => {
  const voxel = useContext(VoxelKoalaContext)

  useEffect(() => {
    voxel.current.to_work()
  }, [voxel])

  const { language } = useLanguage()
  const cvDataArray = useMemo(() => ({
    'en': cvDataEN,
    'en.s': cvDataENS,
    'es': cvDataES,
    'es.s': cvDataESS,
    'zh': cvDataZH,
    'zh.s': cvDataZHS
  }), [])
  const guiArray = useMemo(() => ({
    'en': guiEN,
    'en.s': guiEN,
    'es': guiES,
    'es.s': guiES,
    'zh': guiZH,
    'zh.s': guiZH
  }), [])
  const [cvData, setCvData] = useState(cvDataEN)
  const [gui, setGui] = useState(guiEN)
  useEffect(() => {
    setCvData(cvDataArray[language])
    setGui(guiArray[language])
  }, [language, cvDataArray, guiArray])

  // Función para calcular los meses de uso de cada tecnología
  const calculateTechnologyUsage = () => {
    const techUsage = {}

    cvDataEN.works.forEach(work => {
      const period = work.period_time.split(' - ')
      const startDate = moment(period[0], 'MMMM YYYY')
      const endDate = moment(period[1], 'MMMM YYYY')
      const duration = endDate.diff(startDate, 'months')

      let job_techs = []
      work.projects.forEach(project => {
        project.technologies.forEach(tech => {
          if (techUsage[tech]) {
            if (!job_techs.includes(tech)) {
              techUsage[tech] += duration
              job_techs.push(tech)
            }
          } else {
            techUsage[tech] = duration
            job_techs.push(tech)
          }
        })
      })
    })
    repos.forEach(repo => {
      repo.technologies.forEach(tech => {
        if (techUsage[tech.tech]) {
          techUsage[tech.tech] += tech.time
        } else {
          techUsage[tech.tech] = tech.time
        }
      })
    })

    return techUsage
  }

  // Uso de useMemo para memorizar el uso de las tecnologías
  const technologyUsage = useMemo(calculateTechnologyUsage, [])

  // Estado para las tecnologías seleccionadas
  const [selectedTechnologies, setSelectedTechnologies] = useState(() => {
    const initialState = {}
    Object.keys(technologyUsage).forEach(tech => {
      initialState[tech] = true; // Todas las tecnologías están marcadas inicialmente
    })
    return initialState
  })

  // Estado para el checkbox "seleccionar todo"
  const [selectAll, setSelectAll] = useState(true)

  // Manejar el cambio de selección de las tecnologías
  const handleTechnologyChange = (tech) => {
    setSelectedTechnologies(prevState => ({
      ...prevState,
      [tech]: !prevState[tech]
    }))
  }

  // Manejar el cambio del checkbox "seleccionar todo"
  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    const newSelectedTechnologies = {}
    Object.keys(technologyUsage).forEach(tech => {
      newSelectedTechnologies[tech] = newSelectAll
    })
    setSelectedTechnologies(newSelectedTechnologies)
  }

  // Filtrar los trabajos basados en las tecnologías seleccionadas
  const filteredWorks = cvData.works.filter(work => {
    return work.projects.some(project => {
      return project.technologies.some(tech => selectedTechnologies[tech])
    })
  })

  // Filtrar los proyectos basados en las tecnologías seleccionadas
  const filteredProjects = repos.filter(repo => {
    return repo.technologies.map(t => t.tech).some(tech => selectedTechnologies[tech])
  })

  const { width } = useWindowSize()
  const isMobile = width < 768; // Define el tamaño de pantalla móvil como < 768px

  return (
    <Layout title="Works">
      <Container display="flex" flexDirection={isMobile ? 'column' : 'row'} maxW={'100%'}>
        <Box flex="3">
          <Section>
            <Heading as="h3" fontSize={20} mb={4}>
              {gui.jobs.title}
            </Heading>

            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {filteredWorks.map((work, index) => (
                <WorkGridItem key={index}
                  id={index.toString()}
                  title={work.name}
                  thumbnail={`/images/works/${work.thumbnail}`}>
                  {work.short_description}
                </WorkGridItem>
              ))}
            </SimpleGrid>
          </Section>

          <Divider my={6} />
          <Section delay={0.2}>
            <Heading as="h3" fontSize={20} mb={4}>
              {gui.jobs.own_projects}
            </Heading>
            <SimpleGrid columns={[1, 1, 2]} gap={6}>
              {filteredProjects.map((repo) => (
                <ProjectGridItem key={'Repo' + repo.id}
                  id={repo.url}
                  title={repo.lang[language.replace(".s", "")].name}
                  thumbnail={repo.thumbnail}>
                  {repo.lang[language.replace(".s", "")].desc}
                </ProjectGridItem>
              ))}
            </SimpleGrid>
          </Section>
        </Box>

        <Box flex="1" ml={6} bg={useColorModeValue('whiteAlpha.600', 'blackAlpha.600')} p={1} rounded={'md'}>
          <Heading as="h3" fontSize={20} mb={4}>
            {gui.jobs.techs}
          </Heading>
          <p style={{ fontSize: '10pt' }}>
            {gui.jobs.tech_text}
          </p>
          <TechBadge
            tech="Select All"
            isSelected={selectAll}
            onToggle={handleSelectAllChange}
          />
          <Wrap gap={0.1}>
            {Object.keys(technologyUsage).sort().map((tech, index) => (
              <WrapItem key={index}>
                <TechBadge
                  tech={tech}
                  usage={technologyUsage[tech]} // Pasa el número de meses al TechBadge
                  isSelected={selectedTechnologies[tech]}
                  onToggle={handleTechnologyChange}
                />
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </Container>
    </Layout >
  )
}

export default Works
