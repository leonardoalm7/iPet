export interface Pet {
  microchip: string;
  nome: string;
  dataNascimento: string; // formato DD/MM/YYYY
  proprietario: string;
  raca: string;
  vacina: {
    data: string; // formato DD/MM/YYYY
    valida: boolean;
  };
  sorologia?: {
    data: string; // formato DD/MM/YYYY
    valor: string; // ex: "1.0 UI/mL"
    status: "OK" | "Pendente";
  };
  foto: string; // URL do placeholder
}

export const pets: Pet[] = [
  {
    microchip: "963003100418164",
    nome: "José Manuel Carrara Braga de Almeida Lovedoggy",
    dataNascimento: "11/03/2025",
    proprietario: "Leonardo Braga de Almeida",
    raca: "Chihuahua",
    vacina: {
      data: "12/07/2025",
      valida: true,
    },
    sorologia: {
      data: "04/10/2025",
      valor: "1.0 UI/mL",
      status: "OK",
    },
    foto: "https://images.pexels.com/photos/19405669/pexels-photo-19405669.jpeg?_gl=1*1mrcx9m*_ga*MjIwNzM3Nzg4LjE3NjU0MDExNTg.*_ga_8JE65Q40S6*czE3Njk2NDQwODUkbzIkZzEkdDE3Njk2NDQyNzgkajM1JGwwJGgw",
  },
  {
    microchip: "901011000051821",
    nome: "Mavie Carrara Braga de Almeida Lovedoggy",
    dataNascimento: "07/10/2025",
    proprietario: "Leonardo Braga de Almeida",
    raca: "Chihuahua",
    vacina: {
      data: "17/01/2026",
      valida: true,
    },
    sorologia: undefined, // Pendente
    foto: "https://images.pexels.com/photos/33334531/pexels-photo-33334531.jpeg?_gl=1*1j1rg5e*_ga*MjIwNzM3Nzg4LjE3NjU0MDExNTg.*_ga_8JE65Q40S6*czE3Njk2NDQwODUkbzIkZzEkdDE3Njk2NDQxMzYkajkkbDAkaDA.",
  },
];
