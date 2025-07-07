
locals {
  codeowners = split(
    "\n",
    trimspace(file("../CODEOWNERS"))
  )

  members = [
    for line in local.codeowners : {
      username = replace(split(" ", line)[1], "@", "")
      role = (
        length(split(" ", line)) > 2 ? replace(split(" ", line)[2], "#", "") : "member"
      )
    }
  ]
}

resource "github_membership" "members" {
  for_each = { for member in local.members : member.username => member }

  username = each.value.username
  role     = each.value.role

  lifecycle {
    ignore_changes = [role]
  }
}

/*
import {
  for_each = { for member in local.members : member.username => member }
  to = github_membership.members[each.value.username]
  id = "anthrotech-dev:${each.value.username}"
}
*/

