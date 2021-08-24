#!/bin/bash
sed 's,\$TARGET_ROLE,'$TARGET_ROLE',g' |
sed 's,\$IMAGE_VERSION,'$IMAGE_VERSION',g' |
tee
