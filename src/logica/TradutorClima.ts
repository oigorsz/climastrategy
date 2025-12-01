import { IEstrategia, DadosClima } from "./IEstrategia";
import { EstrategiaCorrer, EstrategiaPraia, EstrategiaPiquenique } from "./EstrategiasConcretas";

export class TradutorClima {
    
    // Este método recebe a atividade e os dados do clima
    public processar(atividade: string, clima: DadosClima): string {
        
        let estrategia: IEstrategia;

        // Escolher a classe certa
        switch (atividade.toLowerCase()) {
            case 'correr':
                estrategia = new EstrategiaCorrer();
                break;
            case 'praia':
            case 'praia/piscina':
                estrategia = new EstrategiaPraia();
                break;
            case 'piquenique':
                estrategia = new EstrategiaPiquenique();
                break;
            default:
                return "Atividade não reconhecida no sistema.";
        }

        return estrategia.avaliar(clima);
    }
}