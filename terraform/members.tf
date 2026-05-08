
locals {
  codeowners = split(
    "\n",
    trimspace(file("../CODEOWNERS"))
  )

  members = [
    for line in local.codeowners : {
      username = replace(split(" ", line)[1], "@", "")
      org_role = (
        length(split(" ", line)) > 2 ? replace(split(" ", line)[2], "#", "") : "member"
      )

      team_role = (
        length(split(" ", line)) > 2 && replace(split(" ", line)[2], "#", "") == "admin"
        ? "maintainer"
        : "member"
      )
    }
  ]

  member_map = {
    for member in local.members : member.username => member
  }
}

resource "github_membership" "members" {
  for_each = local.member_map

  username = each.value.username
  role     = each.value.org_role

  lifecycle {
    ignore_changes = [role]
  }
}

data "github_team" "anthrotect" {
  slug = "Anthrotect"
}

resource "github_team_membership" "anthrotect" {
  for_each = local.member_map

  team_id  = data.github_team.anthrotect.id
  username = each.value.username
  role     = each.value.team_role

  lifecycle {
    ignore_changes = [role]
  }

  depends_on = [
    github_membership.members
  ]
}


/*
import {
  for_each = { for member in local.members : member.username => member }
  to = github_membership.members[each.value.username]
  id = "anthrotech-dev:${each.value.username}"
}
*/

