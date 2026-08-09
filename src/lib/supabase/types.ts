// Tipos de la base de datos, escritos a mano a partir de supabase/schema.sql.
// Si el esquema cambia, actualizar acá (o regenerar con `supabase gen types`
// una vez instalado el CLI de Supabase).

export type Rol = "corredor" | "organizador" | "superadmin";
export type EstadoCarrera = "disputada" | "proxima";

export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: { id: string; nombre: string; orden: number };
        Insert: { id: string; nombre: string; orden: number };
        Update: Partial<{ id: string; nombre: string; orden: number }>;
        Relationships: [];
      };
      carreras: {
        Row: {
          id: string;
          numero: number;
          nombre: string;
          lugar: string;
          lat: number;
          lng: number;
          estado: EstadoCarrera;
        };
        Insert: {
          id: string;
          numero: number;
          nombre: string;
          lugar: string;
          lat: number;
          lng: number;
          estado: EstadoCarrera;
        };
        Update: Partial<{
          id: string;
          numero: number;
          nombre: string;
          lugar: string;
          lat: number;
          lng: number;
          estado: EstadoCarrera;
        }>;
        Relationships: [];
      };
      perfiles: {
        Row: {
          id: string;
          nombre: string;
          numero: number | null;
          categoria_id: string | null;
          bici: string | null;
          equipo: string | null;
          foto_url: string | null;
          puntos_iniciales: number;
          rol: Rol;
          created_at: string;
        };
        Insert: {
          id: string;
          nombre: string;
          numero?: number | null;
          categoria_id?: string | null;
          bici?: string | null;
          equipo?: string | null;
          foto_url?: string | null;
          puntos_iniciales?: number;
          rol?: Rol;
        };
        Update: Partial<{
          nombre: string;
          numero: number | null;
          categoria_id: string | null;
          bici: string | null;
          equipo: string | null;
          foto_url: string | null;
          puntos_iniciales: number;
          rol: Rol;
        }>;
        Relationships: [];
      };
      corredores_precarga: {
        Row: {
          id: string;
          nombre: string;
          categoria_id: string;
          puntos_iniciales: number;
          perfil_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nombre: string;
          categoria_id: string;
          puntos_iniciales?: number;
          perfil_id?: string | null;
        };
        Update: Partial<{
          nombre: string;
          categoria_id: string;
          puntos_iniciales: number;
          perfil_id: string | null;
        }>;
        Relationships: [];
      };
      resultados: {
        Row: {
          id: string;
          carrera_id: string;
          corredor_id: string;
          categoria_id: string;
          posicion: number;
          puntos: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          carrera_id: string;
          corredor_id: string;
          categoria_id: string;
          posicion: number;
          puntos?: number;
        };
        Update: Partial<{
          posicion: number;
          puntos: number;
        }>;
        Relationships: [];
      };
    };
    Views: {
      ranking_general: {
        Row: {
          categoria_id: string;
          corredor_id: string;
          nombre: string;
          numero: number | null;
          bici: string | null;
          equipo: string | null;
          foto_url: string | null;
          puntos_base: number;
          total_puntos: number;
          es_precarga: boolean;
        };
        Relationships: [];
      };
    };
    Functions: {
      vincular_precarga: {
        Args: { precarga_id: string; perfil_id_destino: string };
        Returns: undefined;
      };
      asignar_rol: {
        Args: { perfil_id_destino: string; nuevo_rol: Rol };
        Returns: undefined;
      };
    };
  };
}
