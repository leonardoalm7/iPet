### Mapa de Contexto - Smart Pet Pass

```text
                        [ Cias Aéreas ]
                               ^
                               |
                      ( Customer-Supplier )
                               |
                               |
[ Cadastro Pets ] <---( Shared Kernel )---> [ PET Pass ] ---( Customer-Supplier )---> [ Gestão Saúde ]
      |                                        |
      |                                        |---( ACL )---> [ Mapas / Geo APIs ]
      |                                        |
      |                                        |---( ACL )---> [ Notificações Push ]
      |                                        |
      |                                        v
[ Veterinários ] ----------------------------( ACL )----------------------------> [ Gestão Saúde ]


[ Pagamentos ] ---------------------------( Conformist )------------------------> [ Gateway Financeiro ]
