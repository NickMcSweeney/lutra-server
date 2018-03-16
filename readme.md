# Lutra server

### Start Database
`mongod --dbpath ./data/db`

### Crypt Files - using git-crypt
> For ease of use keys and env vars are stored encrypted
using: https://github.com/AGWA/git-crypt

basic setup is as follows:
 * `git-crypt init`
 * `git-crypt add-gpg-user USER_ID`
 * `git-crypt status`

 #### Unlock
  * `git-crypt unlock`

 #### Lock
  * `git-crypt lock`
