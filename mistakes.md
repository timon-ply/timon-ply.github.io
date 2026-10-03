# Mistakes

## Background generators during cleanup

When generated folders reappear during cleanup, inspect and stop background commands that can regenerate artifacts before removing the folders. Verify the workspace stays clean after the process is stopped.

## Generated text assets

Write generated text explicitly as UTF-8 with LF, and include new assets in the staged diff check. Working-tree diff checks alone miss untracked files and their encoding or line-ending problems.
