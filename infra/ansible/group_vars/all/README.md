# ⚠️  IMPORTANT - Secrets File
# File này KHÔNG BAO GIỜ được commit lên Git.
# Khi deploy thật, tạo file vault riêng bằng:
#   ansible-vault create group_vars/all/vault.yml
#
# Sau khi tạo, uncomment các dòng dưới để dùng trong group_vars/all.yml:
#   pg_password: "{{ vault_pg_password }}"
#   jwt_secret:  "{{ vault_jwt_secret }}"

# === EXAMPLES ONLY - KHÔNG DÙNG GIÁ TRỊ NÀY ===
# vault_pg_password: "CHANGE_ME"
# vault_jwt_secret: "CHANGE_ME"

# Cấu trúc file vault nên có:
# vault_pg_password: "abc123StrongPassword!"
# vault_jwt_secret: "kjasdhf9823hr9823hfsd...64chars"
# vault_cors_origin: "https://coffeehome.vn"
