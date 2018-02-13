# Lutra server

### Start Database
`mongod --dbpath ./data/db`

### Crypt Files - using git-crypt
 * `git-crypt init`
 * `git-crypt add-gpg-user USER_ID`
 * `git-crypt status`

 #### Unlock
  * `git-crypt unlock`

 #### Lock
  * `git-crypt lock`
